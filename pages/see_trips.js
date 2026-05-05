import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { FaMapMarkerAlt, FaClock, FaChair, FaRoute, FaUser } from "react-icons/fa";
import Map from "../components/Map";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Head from "next/head";

const SeeTrips = () => {
  const mapRef = useRef(null);
  const [location, setLocation] = useState([44, 36.2]);
  const [trips, setTrips] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState({});
  const [userId, setUserId] = useState(null);
  const [sortValue, setSortValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push('/login'); return; }
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    setUserId(decodedToken.userId);
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
        const url = sortValue ? `/api/getTrips?sort=${sortValue}` : '/api/getTrips';
        const res = await fetch(url);
        if (res.ok) setTrips(await res.json());
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [sortValue]);

  const handleRequestSeat = (tripId) => {
    setSelectedSeats(prev => ({ ...prev, [tripId]: (prev[tripId] || 0) + 1 }));
    setTrips(prev => prev.map(t => t.tripId === tripId ? { ...t, availableSeats: t.availableSeats - 1 } : t));
  };

  const handleSubmit = async (tripId) => {
    try {
      const res = await fetch("/api/requestSeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tripId, nbr_seat_req: selectedSeats[tripId] || 0 }),
      });
      if (res.ok) {
        toast.success("Seat requested successfully!");
        router.push("/");
      } else {
        toast.error("Failed to request seat. Please try again.");
      }
    } catch (e) { toast.error("An error occurred."); }
  };

  const handleShowOnMap = (trip, e) => {
    e.preventDefault();
    if (!mapRef.current) return;
    const dest = `${trip.destinationLongitude},${trip.destinationLatitude}`;
    const dep = `${trip.departureLongitude},${trip.departureLatitude}`;
    mapRef.current.showPin(dest, trip.destinationLocation, dep, trip.departureLocation);
    mapRef.current.showRoad(dep, dest, true);
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f5f6fa; }

        .st-root { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

        .st-topbar {
          height: 60px; flex-shrink: 0;
          background: #1e2235;
          display: flex; align-items: center;
          padding: 0 1.25rem; gap: 1rem;
        }
        .st-back {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 8px;
          background: rgba(255,255,255,0.08); border: none;
          color: #fff; cursor: pointer; transition: all 0.15s;
          text-decoration: none;
        }
        .st-back:hover { background: rgba(255,255,255,0.15); }
        .st-topbar-title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem; font-weight: 700; color: #fff;
          letter-spacing: -0.01em;
        }
        .st-sort {
          margin-left: auto;
          padding: 0.4rem 0.85rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff; font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; outline: none; cursor: pointer;
        }
        .st-sort option { background: #1e2235; color: #fff; }

        .st-body { flex: 1; display: flex; overflow: hidden; }

        .st-map-col {
          width: 420px; flex-shrink: 0;
          position: relative; overflow: hidden;
          border-right: 1px solid #e5e7eb;
        }
        .st-map-col > div, .st-map-col #map {
          width: 100% !important; height: 100% !important;
          position: absolute !important; top: 0; left: 0;
        }

        .st-list-col {
          flex: 1; overflow-y: auto; padding: 1.25rem;
          display: flex; flex-direction: column; gap: 1rem;
        }

        .st-list-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 0.5rem;
        }
        .st-list-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem; font-weight: 700;
          color: #111827; letter-spacing: -0.01em;
        }
        .st-count {
          font-size: 0.75rem; color: #6b7280;
          background: #f3f4f6; padding: 0.25rem 0.65rem;
          border-radius: 100px; border: 1px solid #e5e7eb;
        }

        .st-card {
          background: #fff; border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 1.1rem 1.25rem;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .st-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: #d1d5db; }

        .st-card-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 0.9rem;
        }
        .st-driver {
          display: flex; align-items: center; gap: 0.6rem;
        }
        .st-driver-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700; color: #fff;
        }
        .st-driver-name { font-size: 0.875rem; font-weight: 600; color: #111827; }
        .st-driver-role { font-size: 0.7rem; color: #9ca3af; }

        .st-seats-badge {
          display: flex; align-items: center; gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 100px;
          font-size: 0.72rem; font-weight: 500; color: #16a34a;
        }

        .st-route {
          display: flex; flex-direction: column; gap: 0.5rem;
          background: #f9fafb; border-radius: 8px;
          padding: 0.75rem 1rem; margin-bottom: 0.9rem;
          border: 1px solid #f3f4f6;
        }
        .st-route-row {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.8rem; color: #374151;
        }
        .st-route-row svg { flex-shrink: 0; }
        .st-divider-line {
          width: 1px; height: 12px;
          background: #d1d5db; margin-left: 7px;
        }

        .st-meta {
          display: flex; gap: 1rem;
          margin-bottom: 0.9rem;
        }
        .st-meta-item {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.75rem; color: #6b7280;
        }

        .st-actions {
          display: flex; gap: 0.5rem; align-items: center;
        }
        .st-seat-ctrl {
          display: flex; align-items: center; gap: 0.5rem;
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 8px; padding: 0.35rem 0.6rem;
        }
        .st-seat-btn {
          width: 22px; height: 22px; border-radius: 50%;
          background: #e5e7eb; border: none; cursor: pointer;
          font-size: 0.9rem; font-weight: 700; color: #374151;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .st-seat-btn:hover { background: #d1d5db; }
        .st-seat-num { font-size: 0.8rem; font-weight: 600; color: #111827; min-width: 16px; text-align: center; }

        .st-btn-submit {
          flex: 1; padding: 0.55rem;
          background: #4f46e5; color: #fff;
          border: none; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
        }
        .st-btn-submit:hover { background: #4338ca; }

        .st-btn-map {
          padding: 0.55rem 0.85rem;
          background: #f0fdf4; color: #16a34a;
          border: 1px solid #bbf7d0; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
        }
        .st-btn-map:hover { background: #dcfce7; }

        .st-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          height: 200px; color: #9ca3af;
          font-size: 0.9rem;
        }
      `}</style>

      <div className="st-root">
        <div className="st-topbar">
          <Link href="/" passHref>
            <a className="st-back"><BsArrowLeft size={16} /></a>
          </Link>
          <div className="st-topbar-title">All Trips</div>
          <select className="st-sort" value={sortValue} onChange={e => setSortValue(e.target.value)}>
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
              <div className="st-list-title">Available Rides</div>
              <div className="st-count">{trips.length} trips</div>
            </div>

            {trips.length === 0 ? (
              <div className="st-empty">No trips available at the moment.</div>
            ) : trips.map((trip) => {
              const seats = selectedSeats[trip.tripId] || 0;
              const driverInitials = `${trip.driver?.firstName?.[0] || ''}${trip.driver?.lastName?.[0] || ''}`;
              return (
                <div key={trip.tripId} className="st-card">
                  <div className="st-card-header">
                    <div className="st-driver">
                      <div className="st-driver-avatar">{driverInitials}</div>
                      <div>
                        <div className="st-driver-name">{trip.driver?.firstName} {trip.driver?.lastName}</div>
                        <div className="st-driver-role">Driver</div>
                      </div>
                    </div>
                    <div className="st-seats-badge">
                      <FaChair size={10} />
                      {trip.availableSeats} seats left
                    </div>
                  </div>

                  <div className="st-route">
                    <div className="st-route-row">
                      <FaMapMarkerAlt size={12} color="#16a34a" />
                      {trip.departureLocation}
                    </div>
                    <div className="st-divider-line" />
                    <div className="st-route-row">
                      <FaMapMarkerAlt size={12} color="#ef4444" />
                      {trip.destinationLocation}
                    </div>
                  </div>

                  <div className="st-meta">
                    <div className="st-meta-item">
                      <FaClock size={11} color="#9ca3af" />
                      {new Date(trip.departureTime).toLocaleString()}
                    </div>
                    <div className="st-meta-item">
                      <FaRoute size={11} color="#9ca3af" />
                      {trip.distance?.toFixed(1)} km
                    </div>
                  </div>

                  <div className="st-actions">
                    <div className="st-seat-ctrl">
                      <button className="st-seat-btn" onClick={() => setSelectedSeats(p => ({ ...p, [trip.tripId]: Math.max(0, (p[trip.tripId] || 0) - 1) }))}>−</button>
                      <span className="st-seat-num">{seats}</span>
                      <button className="st-seat-btn" onClick={() => handleRequestSeat(trip.tripId)}>+</button>
                    </div>
                    <button className="st-btn-submit" onClick={() => handleSubmit(trip.tripId)}>
                      Reserve {seats > 0 ? `(${seats})` : ''}
                    </button>
                    <button className="st-btn-map" onClick={(e) => handleShowOnMap(trip, e)}>
                      Map
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
