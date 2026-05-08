// pages/proposeDrive.js
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Head from "next/head";
import Link from "next/link";

const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

const ProposeDrive = () => {
  const router = useRouter();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const LRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const pickupLatLngRef = useRef(null);
  const dropoffLatLngRef = useRef(null);
  const pinModeRef = useRef("dropoff");

  const [userId, setUserId] = useState("");
  const [maxSeats, setMaxSeats] = useState(0);
  const [pinMode, setPinMode] = useState("dropoff");
  const [pickup, setPickup] = useState({ coordinates: [0, 0], locationName: "" });
  const [dropoff, setDropoff] = useState({ coordinates: [0, 0], locationName: "" });
  const [rideDetails, setRideDetails] = useState({
    date: "",
    time: "",
    seatsAvailable: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { pinModeRef.current = pinMode; }, [pinMode]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    const decoded = JSON.parse(atob(token.split(".")[1]));
    setUserId(decoded.userId);
  }, []);

  useEffect(() => {
    fetch("/api/getMaxSeatsPerTrip")
      .then((r) => r.json())
      .then((d) => setMaxSeats(d.maxSeatsPerTrip || 0))
      .catch(console.error);
  }, []);

  // Init Leaflet map
  useEffect(() => {
    if (typeof window === "undefined") return;
    import("leaflet").then((L) => {
      if (mapRef.current) return;
      LRef.current = L;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const makeIcon = (color, label) => L.divIcon({
        className: "",
        html: `<div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:13px;height:13px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.25);"></div>
          <div style="background:${color};color:#fff;font-size:7px;font-weight:700;padding:1px 5px;border-radius:3px;margin-top:2px;white-space:nowrap;">${label}</div>
        </div>`,
        iconSize: [50, 30], iconAnchor: [25, 7],
      });
      L._makeIcon = makeIcon;

      const map = L.map(mapContainerRef.current).setView([36.7, 3.0], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap", maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;

      const drawRoute = (p, d) => {
        if (!p || !d) return;
        if (routeLineRef.current) { routeLineRef.current.remove(); routeLineRef.current = null; }
        const line = L.polyline([p, d], {
          color: "#6366f1", weight: 3, opacity: 0.75, dashArray: "8,4",
        }).addTo(map);
        routeLineRef.current = line;
        map.fitBounds(line.getBounds(), { padding: [50, 50] });
      };

      // Auto-detect pickup
      navigator.geolocation?.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        const name = await reverseGeocode(lat, lng);
        map.setView([lat, lng], 14);
        if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
        pickupMarkerRef.current = L.marker([lat, lng], { icon: makeIcon("#6366f1", "FROM") }).addTo(map);
        pickupLatLngRef.current = [lat, lng];
        setPickup({ coordinates: [lng, lat], locationName: name });
        if (dropoffLatLngRef.current) drawRoute([lat, lng], dropoffLatLngRef.current);
      });

      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        const mode = pinModeRef.current;

        if (mode === "pickup") {
          if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
          pickupMarkerRef.current = L.marker([lat, lng], { icon: makeIcon("#6366f1", "FROM") }).addTo(map);
          pickupLatLngRef.current = [lat, lng];
          const name = await reverseGeocode(lat, lng);
          setPickup({ coordinates: [lng, lat], locationName: name });
          setPinMode("dropoff");
          pinModeRef.current = "dropoff";
          if (dropoffLatLngRef.current) drawRoute([lat, lng], dropoffLatLngRef.current);
        } else {
          if (destMarkerRef.current) destMarkerRef.current.remove();
          destMarkerRef.current = L.marker([lat, lng], { icon: makeIcon("#ef4444", "TO") }).addTo(map);
          dropoffLatLngRef.current = [lat, lng];
          const name = await reverseGeocode(lat, lng);
          setDropoff({ coordinates: [lng, lat], locationName: name });
          if (pickupLatLngRef.current) drawRoute(pickupLatLngRef.current, [lat, lng]);
        }
      });
    });

    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  const handleChange = (e) =>
    setRideDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickup.locationName) { toast.error("Set a pickup location on the map"); return; }
    if (!dropoff.locationName) { toast.error("Set a destination on the map"); return; }
    if (!rideDetails.date) { toast.error("Pick a date"); return; }
    if (!rideDetails.time) { toast.error("Pick a time"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/apiProposeDrive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departure: pickup.locationName,
          destination: dropoff.locationName,
          date: rideDetails.date,
          time: rideDetails.time,
          seatsAvailable: rideDetails.seatsAvailable,
          userId,
          departureLatitude: pickup.coordinates[1],
          departureLongitude: pickup.coordinates[0],
          destinationLatitude: dropoff.coordinates[1],
          destinationLongitude: dropoff.coordinates[0],
        }),
      });

      if (res.ok) {
        toast.success("Trip proposed successfully!");
        router.push("/");
      } else {
        toast.error("Failed to propose trip");
      }
    } catch { toast.error("An error occurred"); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=Geist:wght@300;400;500&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      </Head>

      <style suppressHydrationWarning>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Geist', sans-serif; }

        .pd-root { display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: #f4f5f9; }

        /* TOPBAR */
        .pd-topbar {
          height: 60px; flex-shrink: 0; background: #0f1117;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; padding: 0 1.25rem; gap: 0.85rem;
        }
        .pd-back {
          width: 32px; height: 32px; border-radius: 7px;
          background: rgba(255,255,255,0.08); border: none;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.7); cursor: pointer;
          text-decoration: none; transition: background 0.14s;
        }
        .pd-back:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .pd-topbar-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 0.95rem; font-weight: 600; color: #fff;
        }

        /* BODY */
        .pd-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }

        /* PANEL */
        .pd-panel {
          width: 340px; flex-shrink: 0; background: #fff;
          border-right: 1px solid #e8eaf0;
          display: flex; flex-direction: column; overflow-y: auto;
        }
        .pd-panel-inner { padding: 1.1rem; display: flex; flex-direction: column; gap: 1rem; }

        .pd-panel-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1rem; font-weight: 600; color: #111827;
        }

        /* Pin toggle */
        .pd-pin-toggle {
          display: flex; gap: 0.4rem;
          background: #f4f5f9; border-radius: 9px; padding: 3px;
        }
        .pd-pin-btn {
          flex: 1; padding: 0.42rem 0.6rem; border-radius: 7px;
          border: none; font-family: 'Geist', sans-serif;
          font-size: 0.75rem; font-weight: 500; cursor: pointer;
          transition: all 0.14s; display: flex; align-items: center;
          justify-content: center; gap: 5px;
        }
        .pd-pin-btn.active-pickup { background: #6366f1; color: #fff; }
        .pd-pin-btn.active-dropoff { background: #ef4444; color: #fff; }
        .pd-pin-btn.inactive { background: transparent; color: #9ca3af; }
        .pd-pin-btn.inactive:hover { background: rgba(0,0,0,0.04); color: #374151; }

        /* Location card */
        .pd-loc-card {
          background: #f9fafb; border: 1px solid #e8eaf0; border-radius: 10px; overflow: hidden;
        }
        .pd-loc-row {
          display: flex; align-items: flex-start; gap: 0.65rem;
          padding: 0.7rem 0.9rem; cursor: pointer; transition: background 0.13s;
        }
        .pd-loc-row:hover { background: #f3f4f8; }
        .pd-loc-row.active-row { background: #eef2ff; }
        .pd-loc-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .pd-loc-inner { flex: 1; min-width: 0; }
        .pd-loc-label { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.09em; color: #9ca3af; }
        .pd-loc-value { font-size: 0.78rem; color: #374151; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pd-loc-placeholder { font-size: 0.78rem; color: #c9cdd8; }
        .pd-loc-sep { height: 1px; background: #e8eaf0; }
        .pd-loc-edit { font-size: 0.62rem; color: #6366f1; font-weight: 500; flex-shrink: 0; margin-top: 2px; }

        /* Divider */
        .pd-divider { height: 1px; background: #f0f1f5; }

        /* Section label */
        .pd-section-label {
          font-size: 0.62rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 0.5rem;
        }

        /* Fields */
        .pd-fields { display: flex; flex-direction: column; gap: 0.7rem; }
        .pd-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
        .pd-field { display: flex; flex-direction: column; gap: 0.28rem; }
        .pd-label { font-size: 0.68rem; font-weight: 500; color: #6b7280; }
        .pd-input {
          width: 100%; padding: 0.55rem 0.8rem;
          background: #f9fafb; border: 1px solid #e8eaf0;
          border-radius: 8px; font-size: 0.8rem;
          font-family: 'Geist', sans-serif; color: #111827;
          outline: none; transition: border-color 0.14s, box-shadow 0.14s;
        }
        .pd-input:focus {
          border-color: #6366f1; background: #fff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        /* Max seats hint */
        .pd-max-hint {
          font-size: 0.68rem; color: #9ca3af;
          background: #f9fafb; border: 1px solid #f0f1f5;
          border-radius: 7px; padding: 0.4rem 0.7rem;
          display: flex; align-items: center; gap: 0.4rem;
        }
        .pd-max-hint strong { color: #6366f1; }

        /* Submit */
        .pd-btn-submit {
          width: 100%; padding: 0.6rem;
          background: #6366f1; color: #fff; border: none;
          border-radius: 9px; font-family: 'Geist', sans-serif;
          font-size: 0.82rem; font-weight: 500; cursor: pointer;
          transition: background 0.14s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .pd-btn-submit:hover:not(:disabled) { background: #4f46e5; }
        .pd-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        /* MAP */
        .pd-map { flex: 1; position: relative; overflow: hidden; }
        .pd-map-inner { position: absolute; inset: 0; }
        .leaflet-container { width: 100%; height: 100%; }
        .pd-map-badge {
          position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
          z-index: 999; display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.97); border: 1px solid #e5e7eb;
          border-radius: 100px; padding: 5px 14px;
          font-size: 0.72rem; font-weight: 500; color: #374151;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1); pointer-events: none;
        }
        .pd-mode-dot { width: 8px; height: 8px; border-radius: 50%; }
        .pd-map-hint {
          position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
          background: rgba(255,255,255,0.96); border: 1px solid #e5e7eb;
          border-radius: 100px; padding: 4px 12px;
          font-size: 0.7rem; color: #374151;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08); pointer-events: none; z-index: 999;
        }
      `}</style>

      <div className="pd-root">

        {/* TOPBAR */}
        <div className="pd-topbar">
          <Link href="/" passHref>
            <a className="pd-back">
              <i className="ti ti-arrow-left" style={{ fontSize: 16 }} aria-hidden="true" />
            </a>
          </Link>
          <div className="pd-topbar-title">Propose a Trip</div>
        </div>

        <div className="pd-body">

          {/* PANEL */}
          <div className="pd-panel">
            <div className="pd-panel-inner">
              <div className="pd-panel-title">Trip details</div>

              {/* Pin mode toggle */}
              <div className="pd-pin-toggle">
                <button
                  type="button"
                  className={`pd-pin-btn ${pinMode === "pickup" ? "active-pickup" : "inactive"}`}
                  onClick={() => setPinMode("pickup")}
                >
                  <i className="ti ti-map-pin" style={{ fontSize: 12 }} aria-hidden="true" />
                  Set pickup
                </button>
                <button
                  type="button"
                  className={`pd-pin-btn ${pinMode === "dropoff" ? "active-dropoff" : "inactive"}`}
                  onClick={() => setPinMode("dropoff")}
                >
                  <i className="ti ti-map-pin" style={{ fontSize: 12 }} aria-hidden="true" />
                  Set destination
                </button>
              </div>

              {/* Location display */}
              <div className="pd-loc-card">
                <div
                  className={`pd-loc-row ${pinMode === "pickup" ? "active-row" : ""}`}
                  onClick={() => setPinMode("pickup")}
                >
                  <div className="pd-loc-dot" style={{ background: "#6366f1" }} />
                  <div className="pd-loc-inner">
                    <div className="pd-loc-label">From</div>
                    {pickup.locationName
                      ? <div className="pd-loc-value">{pickup.locationName.split(",").slice(0, 2).join(",")}</div>
                      : <div className="pd-loc-placeholder">Detecting your location…</div>
                    }
                  </div>
                  {pinMode === "pickup" && <div className="pd-loc-edit">clicking map →</div>}
                </div>
                <div className="pd-loc-sep" />
                <div
                  className={`pd-loc-row ${pinMode === "dropoff" ? "active-row" : ""}`}
                  onClick={() => setPinMode("dropoff")}
                >
                  <div className="pd-loc-dot" style={{ background: "#ef4444" }} />
                  <div className="pd-loc-inner">
                    <div className="pd-loc-label">To</div>
                    {dropoff.locationName
                      ? <div className="pd-loc-value">{dropoff.locationName.split(",").slice(0, 2).join(",")}</div>
                      : <div className="pd-loc-placeholder">Click map to set destination</div>
                    }
                  </div>
                  {pinMode === "dropoff" && <div className="pd-loc-edit">clicking map →</div>}
                </div>
              </div>

              <div className="pd-divider" />

              {/* Date & Time */}
              <div>
                <div className="pd-section-label">Schedule</div>
                <div className="pd-fields">
                  <div className="pd-row">
                    <div className="pd-field">
                      <label className="pd-label" htmlFor="date">Date</label>
                      <input
                        className="pd-input" type="date" id="date" name="date"
                        value={rideDetails.date} onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="pd-field">
                      <label className="pd-label" htmlFor="time">Time</label>
                      <input
                        className="pd-input" type="time" id="time" name="time"
                        value={rideDetails.time} onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pd-divider" />

              {/* Seats */}
              <div>
                <div className="pd-section-label">Seats</div>
                <div className="pd-fields">
                  {maxSeats > 0 && (
                    <div className="pd-max-hint">
                      <i className="ti ti-info-circle" style={{ fontSize: 12 }} aria-hidden="true" />
                      Max allowed: <strong>{maxSeats}</strong>
                    </div>
                  )}
                  <div className="pd-field">
                    <label className="pd-label" htmlFor="seatsAvailable">Seats available</label>
                    <input
                      className="pd-input" type="number" id="seatsAvailable" name="seatsAvailable"
                      value={rideDetails.seatsAvailable} onChange={handleChange}
                      min={1} max={maxSeats || 10}
                    />
                  </div>
                </div>
              </div>

              <button
                className="pd-btn-submit"
                onClick={handleSubmit}
                disabled={submitting}
              >
                <i className="ti ti-send" style={{ fontSize: 14 }} aria-hidden="true" />
                {submitting ? "Proposing…" : "Propose trip"}
              </button>

            </div>
          </div>

          {/* MAP */}
          <div className="pd-map">
            <div ref={mapContainerRef} className="pd-map-inner" />
            <div className="pd-map-badge">
              <div
                className="pd-mode-dot"
                style={{ background: pinMode === "pickup" ? "#6366f1" : "#ef4444" }}
              />
              {pinMode === "pickup" ? "Click map to set pickup" : "Click map to set destination"}
            </div>
            <div className="pd-map-hint">
              <i className="ti ti-hand-click" style={{ fontSize: 11 }} aria-hidden="true" /> Click anywhere on the map
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProposeDrive;