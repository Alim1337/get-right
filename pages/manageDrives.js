// pages/manageDrives.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Head from "next/head";

const ManageDrives = () => {
  const [trips, setTrips] = useState([]);
  const [rideRequests, setRideRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("drives");
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const res = await fetch(`/api/apiManageDrives?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips || []);
        setRideRequests(data.rideRequests || []);
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Delete this drive?")) return;
    setDeletingId(tripId);
    try {
      const res = await fetch(`/api/apiManageDrives?tripId=${tripId}`, { method: "DELETE" });
      if (res.ok) {
        setTrips((prev) => prev.filter((t) => t.tripId !== tripId));
        toast.success("Drive deleted");
      } else toast.error("Failed to delete");
    } catch { toast.error("An error occurred"); }
    finally { setDeletingId(null); }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Delete this ride request?")) return;
    setDeletingId(requestId);
    try {
      const res = await fetch(`/api/apiManageDrives?requestId=${requestId}`, { method: "DELETE" });
      if (res.ok) {
        setRideRequests((prev) => prev.filter((r) => r.requestId !== requestId));
        toast.success("Request deleted");
      } else toast.error("Failed to delete");
    } catch { toast.error("An error occurred"); }
    finally { setDeletingId(null); }
  };

  const handleAccept = async (request) => {
    try {
      const res = await fetch("/api/apiManageDrives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: request.requestId, action: "accept" }),
      });
      if (res.ok) {
        setRideRequests((prev) =>
          prev.map((r) => r.requestId === request.requestId ? { ...r, status: "approved" } : r)
        );
        toast.success("Request accepted!");
      } else toast.error("Failed to accept");
    } catch { toast.error("An error occurred"); }
  };

  const handleDecline = async (requestId) => {
    try {
      const res = await fetch("/api/apiManageDrives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "decline" }),
      });
      if (res.ok) {
        setRideRequests((prev) =>
          prev.map((r) => r.requestId === requestId ? { ...r, status: "rejected" } : r)
        );
        toast.success("Request declined");
      }
    } catch { toast.error("An error occurred"); }
  };

  const pendingCount = rideRequests.filter((r) => r.status !== "approved" && r.status !== "rejected").length;

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=Geist:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>


      <style suppressHydrationWarning>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Geist', sans-serif; }

        .md-root { display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: #f4f5f9; }

        /* TOPBAR */
        .md-topbar {
          height: 60px; flex-shrink: 0; background: #0f1117;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; padding: 0 1.25rem; gap: 0.85rem;
        }
        .md-back {
          width: 32px; height: 32px; border-radius: 7px;
          background: rgba(255,255,255,0.08); border: none;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.7); cursor: pointer;
          text-decoration: none; transition: background 0.14s;
        }
        .md-back:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .md-topbar-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 0.95rem; font-weight: 600; color: #fff;
        }

        /* BODY */
        .md-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }

        /* TABS SIDEBAR */
        .md-tabs-col {
          width: 200px; flex-shrink: 0;
          background: #fff; border-right: 1px solid #e8eaf0;
          display: flex; flex-direction: column; padding: 1rem 0.7rem; gap: 2px;
        }
        .md-tabs-label {
          font-size: 0.57rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.12em; color: #9ca3af; padding: 0.5rem 0.6rem 0.3rem;
        }
        .md-tab-btn {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.58rem 0.7rem; border-radius: 7px;
          font-size: 0.81rem; font-weight: 400; cursor: pointer;
          background: none; border: none; width: 100%; text-align: left;
          font-family: 'Geist', sans-serif; color: #6b7280;
          transition: all 0.14s; position: relative;
        }
        .md-tab-btn:hover { background: #f4f5f9; color: #374151; }
        .md-tab-btn.active { background: #eef2ff; color: #4f46e5; font-weight: 500; }
        .md-tab-ic {
          width: 26px; height: 26px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0;
        }
        .md-pending-dot {
          margin-left: auto;
          width: 18px; height: 18px; border-radius: 50%;
          background: #ef4444; color: #fff;
          font-size: 0.6rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }

        /* CONTENT */
        .md-content { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }

        .md-content-header {
          display: flex; align-items: center; justify-content: space-between;
        }
        .md-content-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1rem; font-weight: 600; color: #111827;
        }
        .md-count {
          font-size: 0.7rem; color: #6b7280;
          background: #fff; border: 1px solid #e8eaf0;
          border-radius: 100px; padding: 2px 10px;
        }

        .md-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; height: 200px;
          color: #9ca3af; font-size: 0.85rem; gap: 0.6rem;
        }

        /* Drive card */
        .md-card {
          background: #fff; border: 1px solid #e8eaf0;
          border-radius: 12px; padding: 1rem 1.1rem;
          transition: border-color 0.14s;
        }
        .md-card:hover { border-color: #d1d5db; }

        .md-card-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem; }
        .md-card-id {
          font-size: 0.62rem; color: #9ca3af; font-weight: 500;
          background: #f4f5f9; border-radius: 5px; padding: 2px 7px;
        }

        .md-route {
          background: #f9fafb; border: 1px solid #f0f1f5;
          border-radius: 8px; padding: 0.65rem 0.85rem; margin-bottom: 0.75rem;
          display: flex; flex-direction: column; gap: 0.35rem;
        }
        .md-route-row { display: flex; align-items: flex-start; gap: 0.55rem; font-size: 0.77rem; color: #374151; line-height: 1.4; }
        .md-route-sep { width: 1px; height: 10px; background: #d1d5db; margin-left: 6px; flex-shrink: 0; }

        .md-meta { display: flex; gap: 0.85rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
        .md-meta-item { font-size: 0.7rem; color: #6b7280; display: flex; align-items: center; gap: 4px; }

        .md-card-foot { display: flex; justify-content: flex-end; }
        .md-btn-delete {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.42rem 0.8rem; border-radius: 7px;
          background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; font-family: 'Geist', sans-serif;
          font-size: 0.75rem; font-weight: 500; cursor: pointer;
          transition: background 0.14s;
        }
        .md-btn-delete:hover { background: #fee2e2; }
        .md-btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Request card */
        .md-req-card {
          background: #fff; border: 1px solid #e8eaf0;
          border-radius: 12px; padding: 1rem 1.1rem;
          transition: border-color 0.14s;
        }
        .md-req-card:hover { border-color: #d1d5db; }

        .md-req-head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem; }
        .md-req-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: #6366f1;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.62rem; font-weight: 600; color: #fff; flex-shrink: 0;
        }
        .md-req-name { font-size: 0.85rem; font-weight: 600; color: #111827; }
        .md-req-phone { font-size: 0.7rem; color: #9ca3af; }
        .md-status-pill {
          margin-left: auto; font-size: 0.65rem; font-weight: 600;
          padding: 3px 9px; border-radius: 100px;
        }
        .md-status-pill.approved { background: #f0fdf4; color: #16a34a; }
        .md-status-pill.rejected { background: #fef2f2; color: #dc2626; }
        .md-status-pill.pending { background: #fffbeb; color: #b45309; }

        .md-req-trip {
          background: #f9fafb; border: 1px solid #f0f1f5;
          border-radius: 8px; padding: 0.65rem 0.85rem; margin-bottom: 0.75rem;
          display: flex; flex-direction: column; gap: 0.35rem;
        }
        .md-trip-row { display: flex; align-items: flex-start; gap: 0.55rem; font-size: 0.77rem; color: #374151; line-height: 1.4; }
        .md-trip-sep { width: 1px; height: 10px; background: #d1d5db; margin-left: 6px; flex-shrink: 0; }

        .md-req-meta { display: flex; gap: 0.85rem; margin-bottom: 0.75rem; flex-wrap: wrap; }

        .md-req-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
        .md-btn-accept {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.42rem 0.85rem; border-radius: 7px;
          background: #6366f1; border: none;
          color: #fff; font-family: 'Geist', sans-serif;
          font-size: 0.75rem; font-weight: 500; cursor: pointer;
          transition: background 0.14s;
        }
        .md-btn-accept:hover { background: #4f46e5; }
        .md-btn-decline {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.42rem 0.85rem; border-radius: 7px;
          background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; font-family: 'Geist', sans-serif;
          font-size: 0.75rem; font-weight: 500; cursor: pointer;
          transition: background 0.14s;
        }
        .md-btn-decline:hover { background: #fee2e2; }
      `}</style>

      <div className="md-root">
        <div className="md-topbar">
          <Link href="/" passHref>
            <a className="md-back">
              <i className="ti ti-arrow-left" style={{ fontSize: 16 }} aria-hidden="true" />
            </a>
          </Link>
          <div className="md-topbar-title">Manage Drives</div>
        </div>

        <div className="md-body">
          {/* TABS */}
          <div className="md-tabs-col">
            <div className="md-tabs-label">Sections</div>
            <button
              className={`md-tab-btn ${activeTab === "drives" ? "active" : ""}`}
              onClick={() => setActiveTab("drives")}
            >
              <div className="md-tab-ic" style={{ background: activeTab === "drives" ? "#eef2ff" : "#f4f5f9" }}>
                <i className="ti ti-car" style={{ color: activeTab === "drives" ? "#4f46e5" : "#9ca3af" }} aria-hidden="true" />
              </div>
              My drives
            </button>
            <button
              className={`md-tab-btn ${activeTab === "requests" ? "active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              <div className="md-tab-ic" style={{ background: activeTab === "requests" ? "#eef2ff" : "#f4f5f9" }}>
                <i className="ti ti-users" style={{ color: activeTab === "requests" ? "#4f46e5" : "#9ca3af" }} aria-hidden="true" />
              </div>
              Ride requests
              {pendingCount > 0 && <div className="md-pending-dot">{pendingCount}</div>}
            </button>
          </div>

          {/* CONTENT */}
          <div className="md-content">
            {activeTab === "drives" && (
              <>
                <div className="md-content-header">
                  <div className="md-content-title">Your drives</div>
                  <div className="md-count">{trips.length} total</div>
                </div>

                {trips.length === 0 ? (
                  <div className="md-empty">
                    <i className="ti ti-car-off" style={{ fontSize: 28, color: "#d1d5db" }} aria-hidden="true" />
                    You haven't created any drives yet.
                  </div>
                ) : trips.map((trip) => (
                  <div key={trip.tripId} className="md-card">
                    <div className="md-card-head">
                      <div className="md-meta-item" style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                        Trip #{trip.tripId}
                      </div>
                      <div className="md-meta-item">
                        <i className="ti ti-armchair" style={{ fontSize: 11 }} aria-hidden="true" />
                        <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{trip.availableSeats} seats available</span>
                      </div>
                    </div>

                    <div className="md-route">
                      <div className="md-route-row">
                        <i className="ti ti-circle-dot" style={{ fontSize: 11, color: "#6366f1", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                        {trip.departureLocation}
                      </div>
                      <div className="md-route-sep" />
                      <div className="md-route-row">
                        <i className="ti ti-map-pin" style={{ fontSize: 11, color: "#ef4444", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                        {trip.destinationLocation}
                      </div>
                    </div>

                    <div className="md-meta">
                      <div className="md-meta-item">
                        <i className="ti ti-clock" style={{ fontSize: 11 }} aria-hidden="true" />
                        {new Date(trip.departureTime).toLocaleString()}
                      </div>
                    </div>

                    <div className="md-card-foot">
                      <button
                        className="md-btn-delete"
                        onClick={() => handleDeleteTrip(trip.tripId)}
                        disabled={deletingId === trip.tripId}
                      >
                        <i className="ti ti-trash" style={{ fontSize: 12 }} aria-hidden="true" />
                        {deletingId === trip.tripId ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === "requests" && (
              <>
                <div className="md-content-header">
                  <div className="md-content-title">Ride requests</div>
                  <div className="md-count">{rideRequests.length} total</div>
                </div>

                {rideRequests.length === 0 ? (
                  <div className="md-empty">
                    <i className="ti ti-users-group" style={{ fontSize: 28, color: "#d1d5db" }} aria-hidden="true" />
                    No ride requests yet.
                  </div>
                ) : rideRequests.map((req) => {
                  const status = req.status || "pending";
                  const initials = `${req.users?.firstName?.[0] || ""}${req.users?.lastName?.[0] || ""}`;
                  return (
                    <div key={req.requestId} className="md-req-card">
                      <div className="md-req-head">
                        <div className="md-req-avatar">{initials || "?"}</div>
                        <div>
                          <div className="md-req-name">{req.users?.firstName} {req.users?.lastName}</div>
                          <div className="md-req-phone">{req.users?.phoneNumber}</div>
                        </div>
                        <div className={`md-status-pill ${status}`}>
                          {status === "approved" ? "Accepted" : status === "rejected" ? "Declined" : "Pending"}
                        </div>
                      </div>

                      <div className="md-req-trip">
                        <div className="md-trip-row">
                          <i className="ti ti-circle-dot" style={{ fontSize: 11, color: "#6366f1", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                          {req.trips?.departureLocation}
                        </div>
                        <div className="md-trip-sep" />
                        <div className="md-trip-row">
                          <i className="ti ti-map-pin" style={{ fontSize: 11, color: "#ef4444", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                          {req.trips?.destinationLocation}
                        </div>
                      </div>

                      <div className="md-req-meta">
                        <div className="md-meta-item">
                          <i className="ti ti-clock" style={{ fontSize: 11 }} aria-hidden="true" />
                          <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                            {new Date(req.trips?.departureTime).toLocaleString()}
                          </span>
                        </div>
                        <div className="md-meta-item">
                          <i className="ti ti-armchair" style={{ fontSize: 11 }} aria-hidden="true" />
                          <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                            {req.nbr_seat_req} seat{req.nbr_seat_req > 1 ? "s" : ""} requested
                          </span>
                        </div>
                      </div>

                      <div className="md-req-actions">
                        {status !== "approved" && (
                          <button className="md-btn-accept" onClick={() => handleAccept(req)}>
                            <i className="ti ti-check" style={{ fontSize: 12 }} aria-hidden="true" /> Accept
                          </button>
                        )}
                        <button className="md-btn-decline" onClick={() => handleDecline(req.requestId)}>
                          <i className="ti ti-x" style={{ fontSize: 12 }} aria-hidden="true" /> Decline
                        </button>
                        <button
                          className="md-btn-delete"
                          onClick={() => handleDeleteRequest(req.requestId)}
                          disabled={deletingId === req.requestId}
                        >
                          <i className="ti ti-trash" style={{ fontSize: 12 }} aria-hidden="true" />
                          {deletingId === req.requestId ? "…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageDrives;