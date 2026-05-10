// pages/see_trips.js
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Map from "../components/Map";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Head from "next/head";

const SeeTrips = () => {
  const mapRef = useRef(null);
  const [location, setLocation] = useState([3.042048, 36.737626]);
  const [trips, setTrips] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState({});
  const [userId, setUserId] = useState(null);
  const [sortValue, setSortValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    const decoded = JSON.parse(atob(token.split(".")[1]));
    setUserId(decoded.userId);
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation([pos.coords.longitude, pos.coords.latitude]),
      (err) => console.error(err)
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = sortValue ? `/api/getTrips?sort=${sortValue}` : "/api/getTrips";
        const res = await fetch(url);
        if (res.ok) setTrips(await res.json());
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [sortValue]);

  const handleSeatChange = (tripId, delta) => {
    setSelectedSeats((prev) => {
      const cur = prev[tripId] || 0;
      const trip = trips.find((t) => t.tripId === tripId);
      const max = trip?.availableSeats || 0;
      const next = Math.min(max, Math.max(0, cur + delta));
      return { ...prev, [tripId]: next };
    });
  };

  const handleSubmit = async (tripId) => {
    const seats = selectedSeats[tripId] || 0;
    if (seats === 0) { toast.error("Select at least 1 seat"); return; }
    try {
      const res = await fetch("/api/requestSeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tripId, nbr_seat_req: seats }),
      });
      if (res.ok) { toast.success("Seat reserved!"); router.push("/"); }
      else toast.error("Failed to reserve seat");
    } catch { toast.error("An error occurred"); }
  };

  const handleShowOnMap = (trip) => {
    if (!mapRef.current) return;
    const dest = `${trip.destinationLongitude},${trip.destinationLatitude}`;
    const dep = `${trip.departureLongitude},${trip.departureLatitude}`;
    mapRef.current.showPin(dest, trip.destinationLocation, dep, trip.departureLocation);
    mapRef.current.showRoad(dep, dest, true);
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=Geist:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>


      <style suppressHydrationWarning>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Geist', sans-serif; }

        .st-root { display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: #f4f5f9; }

        /* TOPBAR */
        .st-topbar {
          height: 60px; flex-shrink: 0; background: #0f1117;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; padding: 0 1.25rem; gap: 0.85rem;
        }
        .st-back {
          width: 32px; height: 32px; border-radius: 7px;
          background: rgba(255,255,255,0.08); border: none;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.7); cursor: pointer;
          text-decoration: none; transition: background 0.14s;
        }
        .st-back:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .st-topbar-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 0.95rem; font-weight: 600; color: #fff;
        }
        .st-sort {
          margin-left: auto;
          padding: 0.38rem 0.8rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 7px; color: #fff;
          font-family: 'Geist', sans-serif; font-size: 0.78rem;
          outline: none; cursor: pointer;
        }
        .st-sort option { background: #1e2235; color: #fff; }

        /* BODY */
        .st-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }

        /* MAP COL */
        .st-map-col {
          width: 400px; flex-shrink: 0;
          border-right: 1px solid #e8eaf0;
          position: relative; overflow: hidden;
        }
        .st-map-col > div {
          position: absolute !important;
          top: 0; left: 0; width: 100% !important; height: 100% !important;
        }

        /* LIST COL */
        .st-list-col { flex: 1; overflow-y: auto; padding: 1.1rem; display: flex; flex-direction: column; gap: 0.85rem; }

        .st-list-header {
          display: flex; align-items: center; justify-content: space-between;
        }
        .st-list-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1rem; font-weight: 600; color: #111827;
        }
        .st-count {
          font-size: 0.7rem; color: #6b7280;
          background: #fff; border: 1px solid #e8eaf0;
          border-radius: 100px; padding: 2px 10px;
        }

        /* TRIP CARD */
        .st-card {
          background: #fff; border: 1px solid #e8eaf0;
          border-radius: 12px; padding: 1rem 1.1rem;
          transition: border-color 0.14s, box-shadow 0.14s;
        }
        .st-card:hover { border-color: #d1d5db; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }

        .st-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem; }
        .st-driver { display: flex; align-items: center; gap: 0.55rem; }
        .st-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: #6366f1;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.62rem; font-weight: 600; color: #fff;
        }
        .st-dname { font-size: 0.82rem; font-weight: 600; color: #111827; }
        .st-drole { font-size: 0.66rem; color: #9ca3af; }
        .st-seats-pill {
          font-size: 0.68rem; font-weight: 600; color: #16a34a;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 100px; padding: 2px 9px;
          display: flex; align-items: center; gap: 4px;
        }

        .st-route {
          background: #f9fafb; border: 1px solid #f0f1f5;
          border-radius: 8px; padding: 0.65rem 0.85rem; margin-bottom: 0.8rem;
          display: flex; flex-direction: column; gap: 0.35rem;
        }
        .st-route-row { display: flex; align-items: flex-start; gap: 0.55rem; font-size: 0.77rem; color: #374151; line-height: 1.4; }
        .st-route-sep { width: 1px; height: 10px; background: #d1d5db; margin-left: 6px; flex-shrink: 0; }

        .st-meta { display: flex; gap: 0.85rem; margin-bottom: 0.8rem; flex-wrap: wrap; }
        .st-meta-item { font-size: 0.7rem; color: #6b7280; display: flex; align-items: center; gap: 4px; }

        .st-actions { display: flex; gap: 0.5rem; align-items: center; }
        .st-seat-ctrl {
          display: flex; align-items: center; gap: 0.5rem;
          background: #f9fafb; border: 1px solid #e8eaf0;
          border-radius: 8px; padding: 0.32rem 0.6rem; flex-shrink: 0;
        }
        .st-seat-btn {
          width: 20px; height: 20px; border-radius: 50%;
          background: #e8eaf0; border: none; cursor: pointer;
          font-size: 0.85rem; font-weight: 700; color: #374151;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.13s; line-height: 1;
        }
        .st-seat-btn:hover { background: #d1d5db; }
        .st-seat-num { font-size: 0.78rem; font-weight: 600; color: #111827; min-width: 14px; text-align: center; }

        .st-btn-reserve {
          flex: 1; padding: 0.5rem;
          background: #6366f1; color: #fff;
          border: none; border-radius: 8px;
          font-family: 'Geist', sans-serif; font-size: 0.78rem; font-weight: 500;
          cursor: pointer; transition: background 0.14s;
        }
        .st-btn-reserve:hover { background: #4f46e5; }
        .st-btn-map {
          padding: 0.5rem 0.8rem;
          background: #eef2ff; color: #4f46e5;
          border: 1px solid #c7d2fe; border-radius: 8px;
          font-family: 'Geist', sans-serif; font-size: 0.78rem; font-weight: 500;
          cursor: pointer; transition: background 0.14s;
          display: flex; align-items: center; gap: 4px;
        }
        .st-btn-map:hover { background: #e0e7ff; }

        .st-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; height: 200px;
          color: #9ca3af; font-size: 0.85rem; gap: 0.5rem;
        }
      `}</style>

<div className="st-root" suppressHydrationWarning={true}>
        <div className="st-topbar">
          <Link href="/" passHref>
            <a className="st-back">
              <i className="ti ti-arrow-left" style={{ fontSize: 16 }} aria-hidden="true" />
            </a>
          </Link>
          <div className="st-topbar-title">All Trips</div>
          <select className="st-sort" value={sortValue} onChange={(e) => setSortValue(e.target.value)}>
            <option value="">Sort by…</option>
            <option value="Asc">Departure ↑</option>
            <option value="Dsc">Departure ↓</option>
            <option value="AscDist">Distance ↑</option>
            <option value="DscDist">Distance ↓</option>
          </select>
        </div>

        <div className="st-body">
          <div className="st-map-col">
            <Map ref={mapRef} location={location} />
          </div>

          <div className="st-list-col">
            <div className="st-list-header">
              <div className="st-list-title">Available rides</div>
              <div className="st-count">{trips.length} trips</div>
            </div>

            {trips.length === 0 ? (
              <div className="st-empty">
                <i className="ti ti-car-off" style={{ fontSize: 28, color: "#d1d5db" }} aria-hidden="true" />
                No trips available right now.
              </div>
            ) : trips.map((trip) => {
              const seats = selectedSeats[trip.tripId] || 0;
              const initials = `${trip.driver?.firstName?.[0] || ""}${trip.driver?.lastName?.[0] || ""}`;
              return (
                <div key={trip.tripId} className="st-card">
                  <div className="st-card-head">
                    <div className="st-driver">
                      <div className="st-avatar">{initials || "?"}</div>
                      <div>
                        <div className="st-dname">{trip.driver?.firstName} {trip.driver?.lastName}</div>
                        <div className="st-drole">Driver</div>
                      </div>
                    </div>
                    <div className="st-seats-pill">
                      <i className="ti ti-armchair" style={{ fontSize: 11 }} aria-hidden="true" />
                      {trip.availableSeats} left
                    </div>
                  </div>

                  <div className="st-route">
                    <div className="st-route-row">
                      <i className="ti ti-circle-dot" style={{ fontSize: 11, color: "#6366f1", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                      {trip.departureLocation}
                    </div>
                    <div className="st-route-sep" />
                    <div className="st-route-row">
                      <i className="ti ti-map-pin" style={{ fontSize: 11, color: "#ef4444", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                      {trip.destinationLocation}
                    </div>
                  </div>

                  <div className="st-meta">
                    <div className="st-meta-item">
                      <i className="ti ti-clock" style={{ fontSize: 11 }} aria-hidden="true" />
                      {new Date(trip.departureTime).toLocaleString()}
                    </div>
                    {trip.distance && (
                      <div className="st-meta-item">
                        <i className="ti ti-route" style={{ fontSize: 11 }} aria-hidden="true" />
                        {trip.distance.toFixed(1)} km
                      </div>
                    )}
                  </div>

                  <div className="st-actions">
                    <div className="st-seat-ctrl">
                      <button className="st-seat-btn" onClick={() => handleSeatChange(trip.tripId, -1)}>−</button>
                      <span className="st-seat-num">{seats}</span>
                      <button className="st-seat-btn" onClick={() => handleSeatChange(trip.tripId, +1)}>+</button>
                    </div>
                    <button className="st-btn-reserve" onClick={() => handleSubmit(trip.tripId)}>
                      Reserve{seats > 0 ? ` (${seats})` : ""}
                    </button>
                    <button className="st-btn-map" onClick={() => handleShowOnMap(trip)}>
                      <i className="ti ti-map" style={{ fontSize: 12 }} aria-hidden="true" /> Map
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SeeTrips;