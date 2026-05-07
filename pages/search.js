import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { FaMapMarkerAlt, FaSearch, FaCrosshairs, FaCar, FaChair } from "react-icons/fa";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Head from "next/head";
import ListRides from "../components/ListRides";

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
  const [activeTab, setActiveTab] = useState("search"); // 'search' | 'nearby'

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    const decoded = JSON.parse(atob(token.split(".")[1]));
    setUserId(decoded.userId);
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
          <div style="width:14px;height:14px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
          <div style="background:${color};color:#fff;font-size:8px;font-weight:700;padding:1px 5px;border-radius:3px;margin-top:2px;white-space:nowrap;">${label}</div>
        </div>`,
        iconSize: [50, 30], iconAnchor: [25, 7], popupAnchor: [0, -8],
      });
      L._makeIcon = makeIcon;

      const map = L.map(mapContainerRef.current).setView([36.7, 3.0], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;

      // Auto-detect location
      navigator.geolocation?.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const name = await reverseGeocode(lat, lng);
        map.setView([lat, lng], 14);
        if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
        pickupMarkerRef.current = L.marker([lat, lng], { icon: makeIcon("#4f46e5", "YOU") })
          .addTo(map).bindPopup(`<b>Your location</b><br/>${name}`);
        setPickup({ coordinates: [lng, lat], locationName: name });
      });

      // Click to set destination
      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        const name = await reverseGeocode(lat, lng);
        if (destMarkerRef.current) destMarkerRef.current.remove();
        destMarkerRef.current = L.marker([lat, lng], { icon: makeIcon("#ef4444", "DEST") })
          .addTo(map).bindPopup(`<b>Destination</b><br/>${name}`).openPopup();
        setDropoff({ coordinates: [lng, lat], locationName: name });
        // Draw line
        if (pickupMarkerRef.current) {
          if (routeLineRef.current) routeLineRef.current.remove();
          const p = pickupMarkerRef.current.getLatLng();
          const line = L.polyline([[p.lat, p.lng], [lat, lng]], {
            color: "#4f46e5", weight: 3, opacity: 0.8, dashArray: "8,4",
          }).addTo(map);
          routeLineRef.current = line;
          map.fitBounds(line.getBounds(), { padding: [40, 40] });
        }
      });
    });

    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  const showTripOnMap = (trip) => {
    const L = LRef.current;
    if (!L || !mapRef.current) return;
    const makeIcon = L._makeIcon;
    if (destMarkerRef.current) destMarkerRef.current.remove();
    if (routeLineRef.current) routeLineRef.current.remove();
    const dep = [trip.departureLatitude, trip.departureLongitude];
    const dest = [trip.destinationLatitude, trip.destinationLongitude];
    if (!dep[0] || !dest[0]) return;
    L.marker(dep, { icon: makeIcon("#16a34a", "DEP") }).addTo(mapRef.current)
      .bindPopup(`<b>Departure:</b> ${trip.departureLocation}`).openPopup();
    destMarkerRef.current = L.marker(dest, { icon: makeIcon("#ef4444", "DEST") })
      .addTo(mapRef.current).bindPopup(`<b>Destination:</b> ${trip.destinationLocation}`);
    const line = L.polyline([dep, dest], { color: "#4f46e5", weight: 3, dashArray: "8,4" })
      .addTo(mapRef.current);
    routeLineRef.current = line;
    mapRef.current.fitBounds(line.getBounds(), { padding: [40, 40] });
  };

  const resetToMyLocation = () => {
    const L = LRef.current;
    if (!L || !mapRef.current) return;
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const name = await reverseGeocode(lat, lng);
      mapRef.current.setView([lat, lng], 14);
      if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
      pickupMarkerRef.current = L.marker([lat, lng], { icon: L._makeIcon("#4f46e5", "YOU") })
        .addTo(mapRef.current).bindPopup(`<b>Your location</b><br/>${name}`);
      setPickup({ coordinates: [lng, lat], locationName: name });
      toast.success("Reset to your location!");
    });
  };

  const handleSearch = async () => {
    if (!pickup.locationName) { toast.error("Please set a pickup location"); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/apiSearchTrips?searchTermPickup=${encodeURIComponent(pickup.locationName)}&searchTermDropoff=${encodeURIComponent(dropoff.locationName)}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setShowResults(true);
        setActiveTab("search");
      } else { toast.error("No results found"); }
    } catch { toast.error("Search failed"); }
    finally { setLoading(false); }
  };

  const handleSearchNearby = async () => {
    if (!pickup.coordinates[0]) { toast.error("Location not detected yet"); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/getNearbyTrips?latitude=${pickup.coordinates[1]}&longitude=${pickup.coordinates[0]}&range=${NEARBY_RANGE}`
      );
      if (res.ok) {
        const data = await res.json();
        setNearbyResults(data.formattedTrips);
        setShowResults(true);
        setActiveTab("nearby");
      } else { toast.error("No nearby rides found"); }
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
      if (res.ok) {
        localStorage.setItem("role", "client");
        toast.success("Seat requested successfully!");
      } else { toast.error("Failed to request seat. Please try again."); }
    } catch { toast.error("An error occurred."); }
  };

  const activeResults = activeTab === "search"
    ? searchResults?.formattedTrips
    : nearbyResults;

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f5f6fa; }

        .sr-root { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

        .sr-topbar {
          height: 60px; flex-shrink: 0; background: #1e2235;
          display: flex; align-items: center; padding: 0 1.25rem; gap: 1rem;
        }
        .sr-back {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 8px;
          background: rgba(255,255,255,0.08); border: none;
          color: #fff; cursor: pointer; transition: all 0.15s; text-decoration: none;
        }
        .sr-back:hover { background: rgba(255,255,255,0.15); }
        .sr-topbar-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #fff; }

        .sr-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }

        /* LEFT PANEL */
        .sr-panel {
          width: 360px; flex-shrink: 0; background: #fff;
          border-right: 1px solid #e5e7eb;
          display: flex; flex-direction: column; overflow: hidden;
        }

        .sr-panel-top {
          padding: 1.25rem; border-bottom: 1px solid #f3f4f6;
          display: flex; flex-direction: column; gap: 0.75rem;
        }

        .sr-panel-title {
          font-family: 'Syne', sans-serif; font-size: 1.1rem;
          font-weight: 700; color: #111827;
        }

        .sr-location-box {
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 10px; padding: 0.75rem 1rem;
          display: flex; flex-direction: column; gap: 0.6rem;
        }
        .sr-loc-row {
          display: flex; align-items: flex-start; gap: 0.6rem;
        }
        .sr-loc-icon { flex-shrink: 0; margin-top: 3px; }
        .sr-loc-label { font-size: 0.65rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.07em; }
        .sr-loc-value { font-size: 0.8rem; color: #374151; line-height: 1.4; }
        .sr-loc-placeholder { font-size: 0.8rem; color: #d1d5db; }
        .sr-loc-divider { height: 1px; background: #f3f4f6; margin: 0 -0.25rem; }

        .sr-btn-row { display: flex; gap: 0.5rem; }
        .sr-btn {
          flex: 1; padding: 0.6rem 0.75rem;
          border-radius: 8px; font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; font-weight: 500; cursor: pointer;
          transition: all 0.15s; border: 1px solid;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .sr-btn-primary { background: #4f46e5; color: #fff; border-color: #4f46e5; }
        .sr-btn-primary:hover { background: #4338ca; border-color: #4338ca; }
        .sr-btn-secondary { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
        .sr-btn-secondary:hover { background: #dcfce7; }
        .sr-btn-ghost { background: #f9fafb; color: #6b7280; border-color: #e5e7eb; }
        .sr-btn-ghost:hover { background: #f3f4f6; color: #374151; }
        .sr-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .sr-hint {
          font-size: 0.72rem; color: #9ca3af;
          background: #f9fafb; border: 1px solid #f3f4f6;
          border-radius: 6px; padding: 0.5rem 0.75rem;
          display: flex; align-items: center; gap: 0.4rem;
        }

        /* RESULTS */
        .sr-results { flex: 1; overflow-y: auto; }

        .sr-tabs {
          display: flex; border-bottom: 1px solid #e5e7eb;
          background: #fff; flex-shrink: 0;
        }
        .sr-tab {
          flex: 1; padding: 0.75rem;
          font-size: 0.8rem; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
          border: none; background: transparent;
          color: #9ca3af; border-bottom: 2px solid transparent;
          font-family: 'DM Sans', sans-serif;
        }
        .sr-tab.active { color: #4f46e5; border-bottom-color: #4f46e5; }

        .sr-results-list { padding: 0.75rem; display: flex; flex-direction: column; gap: 0.65rem; }

        .sr-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 2.5rem 1rem;
          color: #9ca3af; font-size: 0.85rem; text-align: center; gap: 0.5rem;
        }

        .sr-card {
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 10px; padding: 0.9rem;
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .sr-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.07); border-color: #d1d5db; }

        .sr-card-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 0.7rem;
        }
        .sr-driver { display: flex; align-items: center; gap: 0.5rem; }
        .sr-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 700; color: #fff;
        }
        .sr-driver-name { font-size: 0.82rem; font-weight: 600; color: #111827; }
        .sr-driver-sub { font-size: 0.68rem; color: #9ca3af; }
        .sr-seats {
          font-size: 0.7rem; font-weight: 500; color: #16a34a;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 100px; padding: 0.2rem 0.6rem;
        }

        .sr-route {
          background: #f9fafb; border-radius: 7px;
          padding: 0.6rem 0.75rem; margin-bottom: 0.7rem;
          display: flex; flex-direction: column; gap: 0.35rem;
          border: 1px solid #f3f4f6;
        }
        .sr-route-row { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.75rem; color: #374151; line-height: 1.4; }
        .sr-route-dot { width: 1px; height: 8px; background: #d1d5db; margin-left: 6px; flex-shrink: 0; }

        .sr-meta { display: flex; gap: 0.75rem; margin-bottom: 0.7rem; flex-wrap: wrap; }
        .sr-meta-item { font-size: 0.72rem; color: #6b7280; display: flex; align-items: center; gap: 3px; }

        .sr-card-actions { display: flex; gap: 0.4rem; }
        .sr-card-btn {
          flex: 1; padding: 0.5rem; border-radius: 7px;
          font-family: 'DM Sans', sans-serif; font-size: 0.75rem; font-weight: 500;
          cursor: pointer; transition: all 0.15s; border: 1px solid;
          display: flex; align-items: center; justify-content: center; gap: 4px;
        }
        .sr-card-btn-map { background: #eef2ff; color: #4f46e5; border-color: #c7d2fe; }
        .sr-card-btn-map:hover { background: #e0e7ff; }
        .sr-card-btn-reserve { background: #4f46e5; color: #fff; border-color: #4f46e5; }
        .sr-card-btn-reserve:hover { background: #4338ca; }

        /* MAP */
        .sr-map-col { flex: 1; position: relative; overflow: hidden; min-height: 0; }
        .sr-map-inner { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .leaflet-container { width: 100%; height: 100%; }

        .sr-map-badge {
          position: absolute; bottom: 1rem; left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.95); border: 1px solid #e5e7eb;
          border-radius: 100px; padding: 0.35rem 0.9rem;
          font-size: 0.72rem; color: #6b7280;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          white-space: nowrap; z-index: 999; pointer-events: none;
        }
      `}</style>

      <div className="sr-root">
        <div className="sr-topbar">
          <Link href="/" passHref>
            <a className="sr-back"><BsArrowLeft size={16} /></a>
          </Link>
          <div className="sr-topbar-title">Search Rides</div>
        </div>

        <div className="sr-body">
          {/* LEFT PANEL */}
          <div className="sr-panel">
            <div className="sr-panel-top">
              <div className="sr-panel-title">Find a Ride</div>

              {/* Location display */}
              <div className="sr-location-box">
                <div className="sr-loc-row">
                  <FaMapMarkerAlt size={12} color="#4f46e5" className="sr-loc-icon" />
                  <div>
                    <div className="sr-loc-label">From</div>
                    {pickup.locationName
                      ? <div className="sr-loc-value">{pickup.locationName.split(',').slice(0, 2).join(',')}</div>
                      : <div className="sr-loc-placeholder">Detecting location…</div>
                    }
                  </div>
                </div>
                <div className="sr-loc-divider" />
                <div className="sr-loc-row">
                  <FaMapMarkerAlt size={12} color="#ef4444" className="sr-loc-icon" />
                  <div>
                    <div className="sr-loc-label">To</div>
                    {dropoff.locationName
                      ? <div className="sr-loc-value">{dropoff.locationName.split(',').slice(0, 2).join(',')}</div>
                      : <div className="sr-loc-placeholder">Click map to set destination</div>
                    }
                  </div>
                </div>
              </div>

              <div className="sr-hint">
                <FaMapMarkerAlt size={10} color="#9ca3af" />
                Click on the map to set your destination
              </div>

              <div className="sr-btn-row">
                <button className="sr-btn sr-btn-primary" onClick={handleSearch} disabled={loading}>
                  <FaSearch size={11} />
                  {loading ? "Searching…" : "Search"}
                </button>
                <button className="sr-btn sr-btn-secondary" onClick={handleSearchNearby} disabled={loading}>
                  <FaCrosshairs size={11} />
                  Nearby
                </button>
                <button className="sr-btn sr-btn-ghost" onClick={resetToMyLocation}>
                  <FaCrosshairs size={11} />
                  My location
                </button>
              </div>
            </div>

            {/* Results */}
            {showResults && (
              <>
                <div className="sr-tabs">
                  <button
                    className={`sr-tab ${activeTab === "search" ? "active" : ""}`}
                    onClick={() => setActiveTab("search")}
                  >
                    Search Results {searchResults?.formattedTrips?.length ? `(${searchResults.formattedTrips.length})` : ""}
                  </button>
                  <button
                    className={`sr-tab ${activeTab === "nearby" ? "active" : ""}`}
                    onClick={() => setActiveTab("nearby")}
                  >
                    Nearby {nearbyResults?.length ? `(${nearbyResults.length})` : ""}
                  </button>
                </div>

                <div className="sr-results">
                  <div className="sr-results-list">
                    {!activeResults || activeResults.length === 0 ? (
                      <div className="sr-empty">
                        <FaCar size={24} color="#d1d5db" />
                        No rides found. Try adjusting your search.
                      </div>
                    ) : activeResults.map((trip) => {
                      const initials = `${trip.driver?.firstName?.[0] || ""}${trip.driver?.lastName?.[0] || ""}`;
                      return (
                        <div key={trip.tripId || trip.ride_id} className="sr-card">
                          <div className="sr-card-header">
                            <div className="sr-driver">
                              <div className="sr-avatar">{initials}</div>
                              <div>
                                <div className="sr-driver-name">{trip.driver?.firstName} {trip.driver?.lastName}</div>
                                <div className="sr-driver-sub">Driver</div>
                              </div>
                            </div>
                            <div className="sr-seats">
                              <FaChair size={9} style={{ display: "inline", marginRight: 3 }} />
                              {trip.availableSeats} seats
                            </div>
                          </div>

                          <div className="sr-route">
                            <div className="sr-route-row">
                              <FaMapMarkerAlt size={10} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                              {trip.departureLocation?.split(",").slice(0, 2).join(",")}
                            </div>
                            <div className="sr-route-dot" />
                            <div className="sr-route-row">
                              <FaMapMarkerAlt size={10} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                              {trip.destinationLocation?.split(",").slice(0, 2).join(",")}
                            </div>
                          </div>

                          <div className="sr-meta">
                            <div className="sr-meta-item">
                              🕐 {new Date(trip.departureTime).toLocaleString()}
                            </div>
                            {trip.distance && (
                              <div className="sr-meta-item">
                                📍 {trip.distance?.toFixed(1)} km
                              </div>
                            )}
                          </div>

                          <div className="sr-card-actions">
                            <button className="sr-card-btn sr-card-btn-map" onClick={() => showTripOnMap(trip)}>
                              Show on map
                            </button>
                            <button
                              className="sr-card-btn sr-card-btn-reserve"
                              onClick={() => handleRequestSeat({ ride_id: trip.tripId || trip.ride_id, requested_seats: 1 })}
                            >
                              Request seat
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
          <div className="sr-map-col">
            <div ref={mapContainerRef} className="sr-map-inner" />
            <div className="sr-map-badge">Click to set destination</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;