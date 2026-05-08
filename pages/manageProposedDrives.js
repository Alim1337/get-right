// pages/manageProposedDrives.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Head from "next/head";

const SeePropositions = () => {
  const [propositions, setPropositions] = useState([]);
  const [driverId, setDriverId] = useState("");
  const [accepting, setAccepting] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    const decoded = JSON.parse(atob(token.split(".")[1]));
    setDriverId(decoded.userId);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/apiManageProposedDrives");
        if (res.ok) setPropositions(await res.json());
        else console.error("Failed to fetch propositions");
      } catch (e) { console.error("Error fetching propositions:", e); }
    };
    fetchData();
  }, []);

  const handleAccept = async (propositionId) => {
    setAccepting(propositionId);
    try {
      const res = await fetch("/api/apiManageProposedDrives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propositionId, driverId, action: "accept" }),
      });
      if (res.ok) {
        setPropositions((prev) => prev.filter((p) => p.propositionId !== propositionId));
        toast.success("Proposition accepted!");
        router.push("/");
      } else {
        toast.error("Failed to accept proposition");
      }
    } catch { toast.error("An error occurred"); }
    finally { setAccepting(null); }
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=Geist:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style suppressHydrationWarning>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Geist', sans-serif; }

        .sp-root { display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: #f4f5f9; }

        /* TOPBAR */
        .sp-topbar {
          height: 60px; flex-shrink: 0; background: #0f1117;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; padding: 0 1.25rem; gap: 0.85rem;
        }
        .sp-back {
          width: 32px; height: 32px; border-radius: 7px;
          background: rgba(255,255,255,0.08); border: none;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.7); cursor: pointer;
          text-decoration: none; transition: background 0.14s;
        }
        .sp-back:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .sp-topbar-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 0.95rem; font-weight: 600; color: #fff;
        }
        .sp-count {
          margin-left: auto;
          font-size: 0.7rem; color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; padding: 3px 10px;
        }

        /* BODY */
        .sp-body { flex: 1; overflow-y: auto; padding: 1.25rem; }

        .sp-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.1rem;
        }
        .sp-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1rem; font-weight: 600; color: #111827;
        }
        .sp-subtitle { font-size: 0.72rem; color: #9ca3af; margin-top: 2px; }

        /* GRID */
        .sp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 0.85rem;
        }

        /* CARD */
        .sp-card {
          background: #fff; border: 1px solid #e8eaf0;
          border-radius: 12px; padding: 1rem 1.1rem;
          display: flex; flex-direction: column; gap: 0;
          transition: border-color 0.14s, box-shadow 0.14s;
        }
        .sp-card:hover { border-color: #d1d5db; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }

        /* Card header — user info */
        .sp-card-head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.85rem; }
        .sp-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: #6366f1; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 600; color: #fff;
        }
        .sp-user-name { font-size: 0.85rem; font-weight: 600; color: #111827; }
        .sp-user-sub { font-size: 0.68rem; color: #9ca3af; margin-top: 1px; }

        /* Route */
        .sp-route {
          background: #f9fafb; border: 1px solid #f0f1f5;
          border-radius: 8px; padding: 0.65rem 0.85rem; margin-bottom: 0.75rem;
          display: flex; flex-direction: column; gap: 0.35rem;
        }
        .sp-route-row {
          display: flex; align-items: flex-start; gap: 0.55rem;
          font-size: 0.77rem; color: #374151; line-height: 1.4;
        }
        .sp-route-sep { width: 1px; height: 10px; background: #d1d5db; margin-left: 6px; flex-shrink: 0; }

        /* Meta */
        .sp-meta { display: flex; gap: 0.75rem; margin-bottom: 0.85rem; flex-wrap: wrap; }
        .sp-meta-item {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.7rem; color: #6b7280;
        }

        /* Accept button */
        .sp-btn-accept {
          width: 100%; padding: 0.55rem;
          background: #6366f1; color: #fff;
          border: none; border-radius: 8px;
          font-family: 'Geist', sans-serif; font-size: 0.8rem; font-weight: 500;
          cursor: pointer; transition: background 0.14s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .sp-btn-accept:hover:not(:disabled) { background: #4f46e5; }
        .sp-btn-accept:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Empty state */
        .sp-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; height: 260px;
          color: #9ca3af; font-size: 0.85rem; gap: 0.6rem;
          background: #fff; border: 1px solid #e8eaf0;
          border-radius: 12px;
        }
        .sp-empty-icon { font-size: 32px; color: #e8eaf0; }
      `}</style>

      <div className="sp-root">

        {/* TOPBAR */}
        <div className="sp-topbar">
          <Link href="/" passHref>
            <a className="sp-back">
              <i className="ti ti-arrow-left" style={{ fontSize: 16 }} aria-hidden="true" />
            </a>
          </Link>
          <div className="sp-topbar-title">Drive Propositions</div>
          <div className="sp-count">{propositions.length} pending</div>
        </div>

        {/* BODY */}
        <div className="sp-body">
          <div className="sp-header">
            <div>
              <div className="sp-title">Incoming propositions</div>
              <div className="sp-subtitle">Passengers requesting a custom trip from you</div>
            </div>
          </div>

          {propositions.length === 0 ? (
            <div className="sp-empty">
              <i className="ti ti-inbox" style={{ fontSize: 32, color: "#e8eaf0" }} aria-hidden="true" />
              No propositions at the moment.
            </div>
          ) : (
            <div className="sp-grid">
              {propositions.map((p) => {
                const initials = `${p.users?.firstName?.[0] || ""}${p.users?.lastName?.[0] || ""}`;
                return (
                  <div key={p.propositionId} className="sp-card">

                    {/* User */}
                    <div className="sp-card-head">
                      <div className="sp-avatar">{initials || "?"}</div>
                      <div>
                        <div className="sp-user-name">{p.users?.firstName} {p.users?.lastName}</div>
                        <div className="sp-user-sub">Passenger</div>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="sp-route">
                      <div className="sp-route-row">
                        <i className="ti ti-circle-dot" style={{ fontSize: 11, color: "#6366f1", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                        {p.departureLocation}
                      </div>
                      <div className="sp-route-sep" />
                      <div className="sp-route-row">
                        <i className="ti ti-map-pin" style={{ fontSize: 11, color: "#ef4444", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                        {p.destinationLocation}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="sp-meta">
                      <div className="sp-meta-item">
                        <i className="ti ti-clock" style={{ fontSize: 11 }} aria-hidden="true" />
                        {new Date(p.departureTime).toLocaleString()}
                      </div>
                      <div className="sp-meta-item">
                        <i className="ti ti-armchair" style={{ fontSize: 11 }} aria-hidden="true" />
                        {p.availableSeats} seat{p.availableSeats !== 1 ? "s" : ""}
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      className="sp-btn-accept"
                      onClick={() => handleAccept(p.propositionId)}
                      disabled={accepting === p.propositionId}
                    >
                      <i className="ti ti-check" style={{ fontSize: 13 }} aria-hidden="true" />
                      {accepting === p.propositionId ? "Accepting…" : "Accept proposition"}
                    </button>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SeePropositions;