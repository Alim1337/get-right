// pages/search.js
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Head from "next/head";

const NEARBY_RANGE = 10;

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

const Search = () => {
  const router = useRouter();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const LRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [pickup, setPickup] = useState({ coordinates: [0, 0], locationName: "" });
  const [dropoff, setDropoff] = useState({ coordinates: [0, 0], locationName: "" });
  const [searchResults, setSearchResults] = useState(null);
  const [nearbyResults, setNearbyResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [pinMode, setPinMode] = useState("dropoff");

  // Refs that mirror state so map click handler always reads fresh values
  const pinModeRef = useRef("dropoff");
  // Store raw [lat, lng] coords for route drawing — avoids stale closure over state
  const pickupLatLngRef = useRef(null);
  const dropoffLatLngRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    const decoded = JSON.parse(atob(token.split(".")[1]));
    setUserId(decoded.userId);
  }, []);

  useEffect(() => { pinModeRef.current = pinMode; }, [pinMode]);

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

      const drawRoute = (pLatLng, dLatLng) => {
        if (!pLatLng || !dLatLng) return;
        if (routeLineRef.current) { routeLineRef.current.remove(); routeLineRef.current = null; }
        const line = L.polyline([pLatLng, dLatLng], {
          color: "#6366f1", weight: 3, opacity: 0.75, dashArray: "8,4",
        }).addTo(map);
        routeLineRef.current = line;
        map.fitBounds(line.getBounds(), { padding: [50, 50] });
      };

      // Auto-detect pickup
      navigator.geolocation?.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const name = await reverseGeocode(lat, lng);
        map.setView([lat, lng], 14);
        if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
        pickupMarkerRef.current = L.marker([lat, lng], { icon: makeIcon("#6366f1", "FROM") }).addTo(map);
        pickupLatLngRef.current = [lat, lng];
        setPickup({ coordinates: [lng, lat], locationName: name });
        // If destination was already set, draw route
        if (dropoffLatLngRef.current) drawRoute([lat, lng], dropoffLatLngRef.current);
      });

      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        const mode = pinModeRef.current;

        // Place marker immediately with a loading label, then reverse geocode
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

  const showTripOnMap = (trip) => {
    const L = LRef.current;
    if (!L || !mapRef.current) return;
    if (destMarkerRef.current) destMarkerRef.current.remove();
    if (routeLineRef.current) routeLineRef.current.remove();
    const dep = [trip.departureLatitude, trip.departureLongitude];
    const dest = [trip.destinationLatitude, trip.destinationLongitude];
    if (!dep[0] || !dest[0]) return;
    L.marker(dep, { icon: L._makeIcon("#16a34a", "DEP") }).addTo(mapRef.current);
    destMarkerRef.current = L.marker(dest, { icon: L._makeIcon("#ef4444", "DEST") }).addTo(mapRef.current);
    const line = L.polyline([dep, dest], { color: "#6366f1", weight: 3, dashArray: "8,4" }).addTo(mapRef.current);
    routeLineRef.current = line;
    mapRef.current.fitBounds(line.getBounds(), { padding: [40, 40] });
  };

  const resetToMyLocation = () => {
    const L = LRef.current;
    if (!L || !mapRef.current) return;
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      const name = await reverseGeocode(lat, lng);
      mapRef.current.setView([lat, lng], 14);
      if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
      pickupMarkerRef.current = L.marker([lat, lng], { icon: L._makeIcon("#6366f1", "FROM") }).addTo(mapRef.current);
      pickupLatLngRef.current = [lat, lng];
      setPickup({ coordinates: [lng, lat], locationName: name });
      toast.success("Reset to your location");
    });
  };

  const handleSearch = async () => {
    if (!pickup.locationName) { toast.error("Set a pickup location first"); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/apiSearchTrips?searchTermPickup=${encodeURIComponent(pickup.locationName)}&searchTermDropoff=${encodeURIComponent(dropoff.locationName)}`
      );
      if (res.ok) { setSearchResults(await res.json()); setShowResults(true); setActiveTab("search"); }
      else toast.error("No results found");
    } catch { toast.error("Search failed"); }
    finally { setLoading(false); }
  };

  const handleSearchNearby = async () => {
    if (!pickup.coordinates[0]) { toast.error("Location not detected yet"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/getNearbyTrips?latitude=${pickup.coordinates[1]}&longitude=${pickup.coordinates[0]}&range=${NEARBY_RANGE}`);
      if (res.ok) { const d = await res.json(); setNearbyResults(d.formattedTrips); setShowResults(true); setActiveTab("nearby"); }
      else toast.error("No nearby rides found");
    } catch { toast.error("Search failed"); }
    finally { setLoading(false); }
  };

  const handleRequestSeat = async (rideInfo) => {
    try {
      const res = await fetch("/api/requestSeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tripId: rideInfo.ride_id, nbr_seat_req: rideInfo.requested_seats }),
      });
      if (res.ok) { localStorage.setItem("role", "client"); toast.success("Seat requested!"); }
      else toast.error("Failed to request seat");
    } catch { toast.error("An error occurred"); }
  };

  const activeResults = activeTab === "search" ? searchResults?.formattedTrips : nearbyResults;

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=Geist:wght@300;400;500&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      </Head>


      <style suppressHydrationWarning>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Geist', sans-serif; }

        .s-root { display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: #f4f5f9; }

        /* TOPBAR */
        .s-topbar {
          height: 60px; flex-shrink: 0; background: #0f1117;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; padding: 0 1.25rem; gap: 0.85rem;
        }
        .s-back {
          width: 32px; height: 32px; border-radius: 7px;
          background: rgba(255,255,255,0.08); border: none;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.7); cursor: pointer;
          text-decoration: none; transition: background 0.14s; flex-shrink: 0;
        }
        .s-back:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .s-topbar-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 0.95rem; font-weight: 600; color: #fff;
        }

        /* BODY */
        .s-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }

        /* PANEL */
        .s-panel {
          width: 340px; flex-shrink: 0; background: #fff;
          border-right: 1px solid #e8eaf0;
          display: flex; flex-direction: column; overflow: hidden;
        }
        .s-panel-top {
          padding: 1.1rem; display: flex; flex-direction: column;
          gap: 0.75rem; border-bottom: 1px solid #f0f1f5; flex-shrink: 0;
        }
        .s-panel-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1rem; font-weight: 600; color: #111827;
        }

        /* Pin mode toggle */
        .s-pin-toggle {
          display: flex; gap: 0.4rem;
          background: #f4f5f9; border-radius: 9px; padding: 3px;
        }
        .s-pin-btn {
          flex: 1; padding: 0.42rem 0.6rem;
          border-radius: 7px; border: none; font-family: 'Geist', sans-serif;
          font-size: 0.75rem; font-weight: 500; cursor: pointer;
          transition: all 0.14s; display: flex; align-items: center;
          justify-content: center; gap: 5px;
        }
        .s-pin-btn.active-pickup { background: #6366f1; color: #fff; }
        .s-pin-btn.active-dropoff { background: #ef4444; color: #fff; }
        .s-pin-btn.inactive { background: transparent; color: #9ca3af; }
        .s-pin-btn.inactive:hover { background: rgba(0,0,0,0.04); color: #374151; }

        /* Location card */
        .s-loc-card {
          background: #f9fafb; border: 1px solid #e8eaf0;
          border-radius: 10px; overflow: hidden;
        }
        .s-loc-row {
          display: flex; align-items: flex-start; gap: 0.65rem;
          padding: 0.7rem 0.9rem; cursor: pointer; transition: background 0.13s;
        }
        .s-loc-row:hover { background: #f3f4f8; }
        .s-loc-row.active-row { background: #eef2ff; }
        .s-loc-dot {
          width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px;
        }
        .s-loc-inner { flex: 1; min-width: 0; }
        .s-loc-label { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.09em; color: #9ca3af; }
        .s-loc-value { font-size: 0.78rem; color: #374151; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .s-loc-placeholder { font-size: 0.78rem; color: #c9cdd8; }
        .s-loc-sep { height: 1px; background: #e8eaf0; }
        .s-loc-edit { font-size: 0.62rem; color: #6366f1; font-weight: 500; flex-shrink: 0; margin-top: 2px; }

        .s-hint {
          font-size: 0.7rem; color: #9ca3af;
          background: #f9fafb; border: 1px solid #f0f1f5;
          border-radius: 7px; padding: 0.45rem 0.7rem;
          display: flex; align-items: center; gap: 0.4rem;
        }

        /* Buttons */
        .s-btn-row { display: flex; gap: 0.5rem; }
        .s-btn {
          flex: 1; padding: 0.55rem 0.7rem; border-radius: 8px;
          font-family: 'Geist', sans-serif; font-size: 0.78rem; font-weight: 500;
          cursor: pointer; transition: all 0.14s; border: 1px solid;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .s-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .s-btn-primary { background: #6366f1; color: #fff; border-color: #6366f1; }
        .s-btn-primary:hover:not(:disabled) { background: #4f46e5; border-color: #4f46e5; }
        .s-btn-green { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
        .s-btn-green:hover:not(:disabled) { background: #dcfce7; }
        .s-btn-ghost { background: #f9fafb; color: #6b7280; border-color: #e5e7eb; }
        .s-btn-ghost:hover { background: #f3f4f6; color: #374151; }

        /* Tabs */
        .s-tabs { display: flex; border-bottom: 1px solid #e8eaf0; flex-shrink: 0; }
        .s-tab {
          flex: 1; padding: 0.7rem; font-size: 0.78rem; font-weight: 500;
          cursor: pointer; border: none; background: transparent;
          color: #9ca3af; border-bottom: 2px solid transparent;
          font-family: 'Geist', sans-serif; transition: all 0.14s;
        }
        .s-tab.active { color: #6366f1; border-bottom-color: #6366f1; }

        /* Results */
        .s-results { flex: 1; overflow-y: auto; }
        .s-results-inner { padding: 0.85rem; display: flex; flex-direction: column; gap: 0.6rem; }
        .s-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 2.5rem 1rem;
          color: #9ca3af; font-size: 0.82rem; text-align: center; gap: 0.5rem;
        }

        /* Trip card */
        .s-card {
          background: #fff; border: 1px solid #e8eaf0;
          border-radius: 11px; padding: 0.85rem;
          transition: border-color 0.14s, box-shadow 0.14s;
        }
        .s-card:hover { border-color: #d1d5db; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
        .s-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem; }
        .s-driver { display: flex; align-items: center; gap: 0.5rem; }
        .s-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: #6366f1;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6rem; font-weight: 600; color: #fff;
        }
        .s-dname { font-size: 0.8rem; font-weight: 600; color: #111827; }
        .s-dsub { font-size: 0.65rem; color: #9ca3af; }
        .s-seats-pill {
          font-size: 0.67rem; font-weight: 600; color: #16a34a;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 100px; padding: 2px 8px;
        }
        .s-route {
          background: #f9fafb; border: 1px solid #f0f1f5;
          border-radius: 8px; padding: 0.6rem 0.8rem; margin-bottom: 0.65rem;
          display: flex; flex-direction: column; gap: 0.3rem;
        }
        .s-route-row { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.73rem; color: #374151; line-height: 1.4; }
        .s-route-sep { width: 1px; height: 8px; background: #d1d5db; margin-left: 5px; }
        .s-meta { display: flex; gap: 0.65rem; margin-bottom: 0.65rem; flex-wrap: wrap; }
        .s-meta-item { font-size: 0.68rem; color: #6b7280; display: flex; align-items: center; gap: 3px; }
        .s-card-actions { display: flex; gap: 0.4rem; }
        .s-card-btn {
          flex: 1; padding: 0.48rem; border-radius: 7px;
          font-family: 'Geist', sans-serif; font-size: 0.73rem; font-weight: 500;
          cursor: pointer; transition: all 0.14s; border: 1px solid;
          display: flex; align-items: center; justify-content: center; gap: 4px;
        }
        .s-card-btn-map { background: #eef2ff; color: #4f46e5; border-color: #c7d2fe; }
        .s-card-btn-map:hover { background: #e0e7ff; }
        .s-card-btn-res { background: #6366f1; color: #fff; border-color: #6366f1; }
        .s-card-btn-res:hover { background: #4f46e5; }

        /* MAP */
        .s-map { flex: 1; position: relative; overflow: hidden; }
        .s-map-inner { position: absolute; inset: 0; }
        .leaflet-container { width: 100%; height: 100%; }
        .s-map-hint {
          position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
          background: rgba(255,255,255,0.96); border: 1px solid #e5e7eb;
          border-radius: 100px; padding: 5px 14px;
          font-size: 0.7rem; color: #374151;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          pointer-events: none; z-index: 999; white-space: nowrap;
        }
        .s-map-mode-badge {
          position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
          z-index: 999; display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.97); border: 1px solid #e5e7eb;
          border-radius: 100px; padding: 5px 14px;
          font-size: 0.72rem; font-weight: 500; color: #374151;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1); pointer-events: none;
        }
        .s-mode-dot { width: 8px; height: 8px; border-radius: 50%; }
      `}</style>

      <div className="s-root">
        <div className="s-topbar">
          <Link href="/" passHref>
            <a className="s-back">
              <i className="ti ti-arrow-left" style={{ fontSize: 16 }} aria-hidden="true" />
            </a>
          </Link>
          <div className="s-topbar-title">Search Rides</div>
        </div>

        <div className="s-body">
          {/* PANEL */}
          <div className="s-panel">
            <div className="s-panel-top">
              <div className="s-panel-title">Find a ride</div>

              {/* Pin mode selector */}
              <div className="s-pin-toggle">
                <button
                  className={`s-pin-btn ${pinMode === "pickup" ? "active-pickup" : "inactive"}`}
                  onClick={() => setPinMode("pickup")}
                >
                  <i className="ti ti-map-pin" style={{ fontSize: 12 }} aria-hidden="true" />
                  Set pickup
                </button>
                <button
                  className={`s-pin-btn ${pinMode === "dropoff" ? "active-dropoff" : "inactive"}`}
                  onClick={() => setPinMode("dropoff")}
                >
                  <i className="ti ti-map-pin" style={{ fontSize: 12 }} aria-hidden="true" />
                  Set destination
                </button>
              </div>

              {/* Location display */}
              <div className="s-loc-card">
                <div
                  className={`s-loc-row ${pinMode === "pickup" ? "active-row" : ""}`}
                  onClick={() => setPinMode("pickup")}
                >
                  <div className="s-loc-dot" style={{ background: "#6366f1" }} />
                  <div className="s-loc-inner">
                    <div className="s-loc-label">From</div>
                    {pickup.locationName
                      ? <div className="s-loc-value">{pickup.locationName.split(",").slice(0, 2).join(",")}</div>
                      : <div className="s-loc-placeholder">Detecting your location…</div>
                    }
                  </div>
                  {pinMode === "pickup" && <div className="s-loc-edit">clicking map →</div>}
                </div>
                <div className="s-loc-sep" />
                <div
                  className={`s-loc-row ${pinMode === "dropoff" ? "active-row" : ""}`}
                  onClick={() => setPinMode("dropoff")}
                >
                  <div className="s-loc-dot" style={{ background: "#ef4444" }} />
                  <div className="s-loc-inner">
                    <div className="s-loc-label">To</div>
                    {dropoff.locationName
                      ? <div className="s-loc-value">{dropoff.locationName.split(",").slice(0, 2).join(",")}</div>
                      : <div className="s-loc-placeholder">Click map to set destination</div>
                    }
                  </div>
                  {pinMode === "dropoff" && <div className="s-loc-edit">clicking map →</div>}
                </div>
              </div>

              <div className="s-btn-row">
                <button className="s-btn s-btn-primary" onClick={handleSearch} disabled={loading}>
                  <i className="ti ti-search" style={{ fontSize: 12 }} aria-hidden="true" />
                  {loading ? "Searching…" : "Search"}
                </button>
                <button className="s-btn s-btn-green" onClick={handleSearchNearby} disabled={loading}>
                  <i className="ti ti-focus" style={{ fontSize: 12 }} aria-hidden="true" />
                  Nearby
                </button>
                <button className="s-btn s-btn-ghost" onClick={resetToMyLocation}>
                  <i className="ti ti-current-location" style={{ fontSize: 12 }} aria-hidden="true" />
                </button>
              </div>
            </div>

            {showResults && (
              <>
                <div className="s-tabs">
                  <button
                    className={`s-tab ${activeTab === "search" ? "active" : ""}`}
                    onClick={() => setActiveTab("search")}
                  >
                    Results {searchResults?.formattedTrips?.length ? `(${searchResults.formattedTrips.length})` : ""}
                  </button>
                  <button
                    className={`s-tab ${activeTab === "nearby" ? "active" : ""}`}
                    onClick={() => setActiveTab("nearby")}
                  >
                    Nearby {nearbyResults?.length ? `(${nearbyResults.length})` : ""}
                  </button>
                </div>
                <div className="s-results">
                  <div className="s-results-inner">
                    {!activeResults || activeResults.length === 0 ? (
                      <div className="s-empty">
                        <i className="ti ti-car-off" style={{ fontSize: 28, color: "#d1d5db" }} aria-hidden="true" />
                        No rides found. Try adjusting your search.
                      </div>
                    ) : activeResults.map((trip) => {
                      const initials = `${trip.driver?.firstName?.[0] || ""}${trip.driver?.lastName?.[0] || ""}`;
                      return (
                        <div key={trip.tripId || trip.ride_id} className="s-card">
                          <div className="s-card-head">
                            <div className="s-driver">
                              <div className="s-avatar">{initials || "?"}</div>
                              <div>
                                <div className="s-dname">{trip.driver?.firstName} {trip.driver?.lastName}</div>
                                <div className="s-dsub">Driver</div>
                              </div>
                            </div>
                            <div className="s-seats-pill">{trip.availableSeats} seats</div>
                          </div>
                          <div className="s-route">
                            <div className="s-route-row">
                              <i className="ti ti-circle-dot" style={{ fontSize: 11, color: "#6366f1", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                              {trip.departureLocation?.split(",").slice(0, 2).join(",")}
                            </div>
                            <div className="s-route-sep" />
                            <div className="s-route-row">
                              <i className="ti ti-map-pin" style={{ fontSize: 11, color: "#ef4444", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                              {trip.destinationLocation?.split(",").slice(0, 2).join(",")}
                            </div>
                          </div>
                          <div className="s-meta">
                            <div className="s-meta-item">
                              <i className="ti ti-clock" style={{ fontSize: 11 }} aria-hidden="true" />
                              {new Date(trip.departureTime).toLocaleString()}
                            </div>
                            {trip.distance && (
                              <div className="s-meta-item">
                                <i className="ti ti-route" style={{ fontSize: 11 }} aria-hidden="true" />
                                {trip.distance.toFixed(1)} km
                              </div>
                            )}
                          </div>
                          <div className="s-card-actions">
                            <button className="s-card-btn s-card-btn-map" onClick={() => showTripOnMap(trip)}>
                              <i className="ti ti-map" style={{ fontSize: 11 }} aria-hidden="true" /> Map
                            </button>
                            <button
                              className="s-card-btn s-card-btn-res"
                              onClick={() => handleRequestSeat({ ride_id: trip.tripId || trip.ride_id, requested_seats: 1 })}
                            >
                              <i className="ti ti-armchair" style={{ fontSize: 11 }} aria-hidden="true" /> Request seat
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* MAP */}
          <div className="s-map">
            <div ref={mapContainerRef} className="s-map-inner" />
            <div className="s-map-mode-badge">
              <div
                className="s-mode-dot"
                style={{ background: pinMode === "pickup" ? "#6366f1" : "#ef4444" }}
              />
              {pinMode === "pickup" ? "Click map to set pickup" : "Click map to set destination"}
            </div>
            <div className="s-map-hint">
              <i className="ti ti-hand-click" style={{ fontSize: 11 }} aria-hidden="true" /> Click anywhere on the map
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;