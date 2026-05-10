// pages/index.js
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Link from "next/link";
import ReservedRidesModal from "../components/ReservedRidesModal";
import ReportModal from "../components/ReportModal";
import { Toaster, toast } from "sonner";
import Head from "next/head";
import {
  FaSearch, FaPlusCircle, FaList, FaCalendarAlt, FaMapMarkerAlt,
  FaExclamationTriangle, FaSignOutAlt, FaCar, FaTicketAlt,
  FaUser, FaChevronRight
} from "react-icons/fa";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

const Index = () => {
  const mapRef = useRef(null);
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState([3.042048, 36.737626]);
  const [reservations, setReservations] = useState([]);
  const [showReservedRidesModal, setShowReservedRidesModal] = useState(false);
  const [counter, setCounter] = useState(0);
  const [role, setRole] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUser({ role, id: decoded.userId, firstName: decoded.firstName, lastName: decoded.lastName });
    } catch {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router, role]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation([pos.coords.longitude, pos.coords.latitude]),
      (err) => console.error(err)
    );
  }, []);

  useEffect(() => {
    if (!user || role === "driver") return;
    fetchReservations();
    const id = setInterval(fetchReservations, 5000);
    return () => clearInterval(id);
  }, [user, role]);

  const fetchReservations = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/apiReservation?userId=${user.id}`);
      const data = await res.json();
      setReservations(data.reservations || []);
      setCounter((prev) => {
        const next = data.numberOfReservations;
        if (next > prev) toast.success("You have a new reservation!");
        return next;
      });
    } catch (e) { console.error(e); }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const showInMap = (reservation) => {
    if (!mapRef.current) return;
    const dest = `${reservation.destinationLongitude},${reservation.destinationLatitude}`;
    mapRef.current.showPin(dest, reservation.destinationLocation);
    mapRef.current.showRoad(location, dest);
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "U";

  const upcomingReservations = reservations.filter(
    (r) => new Date(r.departureTime) > new Date()
  );

  const navLinks = [
    { href: "/search", label: "Search ride", icon: <FaSearch size={13} />, color: "#60a5fa", bg: "rgba(59,130,246,0.13)" },
    { href: "/createRide", label: "Create trip", icon: <FaPlusCircle size={13} />, color: "#a78bfa", bg: "rgba(139,92,246,0.13)" },
    { href: "/see_trips", label: "All trips", icon: <FaList size={13} />, color: "#34d399", bg: "rgba(52,211,153,0.13)" },
  ];

  const actionCards = [
    { href: "/search", icon: <FaSearch size={15} />, bg: "#eff6ff", color: "#3b82f6", title: "Search ride", desc: "Find rides near you" },
    { href: "/createRide", icon: <FaPlusCircle size={15} />, bg: "#f5f3ff", color: "#7c3aed", title: "Create trip", desc: "Offer your seats" },
    { href: "/see_trips", icon: <FaList size={15} />, bg: "#f0fdfa", color: "#0d9488", title: "All trips", desc: "Browse upcoming" },
    role === "driver"
      ? { href: "/manageProposedDrives", icon: <FaCalendarAlt size={15} />, bg: "#eef2ff", color: "#6366f1", title: "My drives", desc: "Manage proposals" }
      : { href: "/proposeDrive", icon: <FaMapMarkerAlt size={15} />, bg: "#eef2ff", color: "#6366f1", title: "Propose trip", desc: "Request a route" },
  ];

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=Geist:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Toaster richColors position="top-right" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Geist', sans-serif; }

        .g-shell { display: flex; width: 100vw; height: 100vh; overflow: hidden; }

        /* SIDEBAR */
        .g-sidebar {
          width: 210px; flex-shrink: 0;
          background: #0f1117;
          display: flex; flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .g-logo {
          padding: 1.3rem 1.1rem 1.1rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 0.55rem;
        }
        .g-logo-mark {
          width: 28px; height: 28px; border-radius: 7px;
          background: #6366f1;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .g-logo-text {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1rem; font-weight: 700; color: #fff; letter-spacing: -0.02em;
        }
        .g-logo-text em { color: #818cf8; font-style: normal; }

        .g-nav { flex: 1; padding: 0.9rem 0.65rem; display: flex; flex-direction: column; gap: 1px; overflow-y: auto; }
        .g-nav-lbl {
          font-size: 0.57rem; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(255,255,255,0.18);
          padding: 0.75rem 0.55rem 0.3rem;
        }
        .g-nav-a {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.58rem 0.7rem; border-radius: 7px;
          color: rgba(255,255,255,0.4); font-size: 0.81rem;
          text-decoration: none; transition: all 0.14s;
        }
        .g-nav-a:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
        .g-nav-a.accent { color: #a5b4fc; }
        .g-nav-a.accent:hover { background: rgba(99,102,241,0.12); color: #c7d2fe; }
        .g-nav-ic {
          width: 27px; height: 27px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .g-sidebar-foot {
          padding: 0.6rem 0.65rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; gap: 1px;
        }
        .g-foot-btn {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.58rem 0.7rem; border-radius: 7px;
          font-size: 0.81rem; cursor: pointer;
          background: none; border: none; width: 100%;
          text-align: left; font-family: 'Geist', sans-serif; transition: all 0.14s;
        }
        .g-foot-btn.danger { color: rgba(248,113,113,0.7); }
        .g-foot-btn.danger:hover { background: rgba(248,113,113,0.09); color: #f87171; }
        .g-foot-btn.muted { color: rgba(255,255,255,0.22); }
        .g-foot-btn.muted:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); }

        /* MAIN */
        .g-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; background: #f4f5f9; }

        /* TOPBAR */
        .g-topbar {
          height: 60px; flex-shrink: 0;
          background: #fff; border-bottom: 1px solid #e8eaf0;
          display: flex; align-items: center; padding: 0 1.4rem; gap: 1rem;
        }
        .g-greeting { font-family: 'Bricolage Grotesque', sans-serif; font-size: 1rem; font-weight: 600; color: #111827; }
        .g-greeting strong { color: #6366f1; }
        .g-sub { font-size: 0.7rem; color: #9ca3af; margin-top: 1px; }
        .g-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 0.5rem; }

        .g-res-btn {
          position: relative; display: flex; align-items: center; gap: 0.4rem;
          padding: 0.42rem 0.85rem;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 8px; color: #16a34a;
          font-size: 0.76rem; font-weight: 500; cursor: pointer;
          font-family: 'Geist', sans-serif; transition: background 0.14s;
          white-space: nowrap;
        }
        .g-res-btn:hover { background: #dcfce7; }
        .g-badge {
          position: absolute; top: -7px; right: -7px;
          background: #ef4444; color: #fff;
          font-size: 0.55rem; font-weight: 700;
          width: 16px; height: 16px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff;
        }
        .g-manage-btn {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.42rem 0.85rem;
          background: #eef2ff; border: 1px solid #c7d2fe;
          border-radius: 8px; color: #4f46e5;
          font-size: 0.76rem; font-weight: 500;
          text-decoration: none; transition: background 0.14s; white-space: nowrap;
        }
        .g-manage-btn:hover { background: #e0e7ff; }
        .g-chip {
          display: flex; align-items: center; gap: 0.42rem;
          padding: 0.28rem 0.65rem 0.28rem 0.28rem;
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 100px; cursor: pointer; transition: border-color 0.14s;
        }
        .g-chip:hover { border-color: #d1d5db; }
        .g-avatar {
          width: 27px; height: 27px; border-radius: 50%; background: #6366f1;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.58rem; font-weight: 600; color: #fff;
        }
        .g-chip-name { font-size: 0.76rem; font-weight: 500; color: #374151; white-space: nowrap; }

        /* BODY */
        .g-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; padding: 1.1rem; gap: 1rem; }

        /* TOP ROW */
        .g-top-row { display: flex; gap: 1rem; align-items: flex-start; flex-shrink: 0; }

        /* Action cards */
        .g-actions { display: flex; gap: 0.7rem; flex-shrink: 0; }
        .g-action-card {
          background: #fff; border: 1px solid #e8eaf0;
          border-radius: 12px; padding: 0.85rem 0.9rem;
          display: flex; flex-direction: column; gap: 0.4rem;
          text-decoration: none; transition: box-shadow 0.14s, border-color 0.14s;
          width: 120px;
        }
        .g-action-card:hover { border-color: #d1d5db; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .g-action-ic { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .g-action-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 0.78rem; font-weight: 600; color: #111827; }
        .g-action-desc { font-size: 0.65rem; color: #9ca3af; line-height: 1.35; }

        .g-vdiv { width: 1px; background: #e8eaf0; align-self: stretch; flex-shrink: 0; }

        /* Stats */
        .g-stats { display: flex; flex-direction: column; gap: 0.6rem; flex-shrink: 0; }
        .g-stat { background: #fff; border: 1px solid #e8eaf0; border-radius: 10px; padding: 0.7rem 1rem; min-width: 105px; }
        .g-stat-num { font-family: 'Bricolage Grotesque', sans-serif; font-size: 1.4rem; font-weight: 700; color: #111827; line-height: 1; }
        .g-stat-lbl { font-size: 0.65rem; color: #9ca3af; margin-top: 3px; }

        /* Reservations strip */
        .g-res-strip { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .g-strip-lbl { font-size: 0.62rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 0.5rem; }
        .g-strip-list { display: flex; flex-direction: column; gap: 0.45rem; }
        .g-strip-item {
          background: #fff; border: 1px solid #e8eaf0; border-radius: 10px;
          padding: 0.58rem 0.85rem; display: flex; align-items: center; gap: 0.7rem;
          cursor: pointer; transition: border-color 0.14s;
        }
        .g-strip-item:hover { border-color: #c7d2fe; }
        .g-strip-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .g-strip-info { flex: 1; min-width: 0; }
        .g-strip-route { font-size: 0.77rem; font-weight: 500; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .g-strip-meta { font-size: 0.65rem; color: #9ca3af; margin-top: 1px; }
        .g-strip-pill { font-size: 0.6rem; font-weight: 600; padding: 2px 7px; border-radius: 20px; flex-shrink: 0; }
        .g-strip-pill.up { background: #f0fdf4; color: #16a34a; }
        .g-strip-pill.past { background: #f9fafb; color: #9ca3af; }
        .g-strip-more { font-size: 0.7rem; color: #6366f1; font-weight: 500; cursor: pointer; padding: 0.25rem 0; text-align: right; display: flex; align-items: center; justify-content: flex-end; gap: 3px; }
        .g-strip-more:hover { text-decoration: underline; }
        .g-strip-empty { font-size: 0.77rem; color: #9ca3af; background: #fff; border: 1px solid #e8eaf0; border-radius: 10px; padding: 0.75rem 1rem; }

        /* MAP */
        .g-map-row {
          flex: 1; min-height: 0; border-radius: 12px;
          overflow: hidden; border: 1px solid #e8eaf0; position: relative;
        }
        .g-map-pill {
          position: absolute; bottom: 12px; left: 12px; z-index: 999;
          background: rgba(255,255,255,0.95); border: 1px solid #e5e7eb;
          border-radius: 100px; padding: 4px 10px 4px 7px;
          font-size: 0.7rem; color: #374151;
          display: flex; align-items: center; gap: 5px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08); pointer-events: none;
        }
        .g-loc-dot { width: 7px; height: 7px; border-radius: 50%; background: #16a34a; flex-shrink: 0; }
      `}</style>

<div className="g-shell" suppressHydrationWarning={true}>
        {/* SIDEBAR */}
        <aside className="g-sidebar">
          <div className="g-logo">
            <div className="g-logo-mark">
              <svg viewBox="0 0 16 16" style={{ width: 14, height: 14, fill: '#fff' }}>
                <path d="M8 1L1 5.5v5L8 15l7-4.5v-5L8 1zm0 2.2l4.5 2.9L8 9l-4.5-2.9L8 3.2z"/>
              </svg>
            </div>
            <div className="g-logo-text">get<em>right</em></div>
          </div>

          <nav className="g-nav">
            <div className="g-nav-lbl">Navigation</div>
            {navLinks.map((n) => (
              <Link href={n.href} key={n.href} passHref>
                <a className="g-nav-a">
                  <div className="g-nav-ic" style={{ background: n.bg }}>
                    <span style={{ color: n.color }}>{n.icon}</span>
                  </div>
                  {n.label}
                </a>
              </Link>
            ))}

            <div className="g-nav-lbl">My trips</div>
            {role === "driver" ? (
              <Link href="/manageProposedDrives" passHref>
                <a className="g-nav-a accent">
                  <div className="g-nav-ic" style={{ background: "rgba(99,102,241,0.12)" }}>
                    <FaCalendarAlt size={13} color="#818cf8" />
                  </div>
                  Proposed trips
                </a>
              </Link>
            ) : (
              <Link href="/proposeDrive" passHref>
                <a className="g-nav-a accent">
                  <div className="g-nav-ic" style={{ background: "rgba(99,102,241,0.12)" }}>
                    <FaMapMarkerAlt size={13} color="#818cf8" />
                  </div>
                  Propose a trip
                </a>
              </Link>
            )}
          </nav>

          <div className="g-sidebar-foot">
            <button
              className="g-foot-btn danger"
              onClick={() => setShowReportModal(true)}
            >
              <FaExclamationTriangle size={13} />
              Report issue
            </button>
            <button className="g-foot-btn muted" onClick={handleDisconnect}>
              <FaSignOutAlt size={13} />
              Sign out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="g-main">
          <div className="g-topbar">
            <div>
              <div className="g-greeting">
                Welcome back, <strong>{user?.firstName} {user?.lastName}</strong>
              </div>
              <div className="g-sub">Your ride dashboard</div>
            </div>
            <div className="g-topbar-right">
              {role === "driver" ? (
                <Link href="/manageDrives" passHref>
                  <a className="g-manage-btn">
                    <FaCar size={12} /> Manage drives
                  </a>
                </Link>
              ) : (
                <button className="g-res-btn" onClick={() => setShowReservedRidesModal(true)}>
                  {counter > 0 && <span className="g-badge">{counter}</span>}
                  <FaTicketAlt size={12} /> My reservations
                </button>
              )}
              <div className="g-chip" onClick={() => router.push("/userProfile")}>
                <div className="g-avatar">{initials}</div>
                <span className="g-chip-name">{user?.firstName} {user?.lastName}</span>
              </div>
            </div>
          </div>

          <div className="g-body">

            {/* TOP ROW */}
            <div className="g-top-row">

              {/* Quick action cards */}
              <div className="g-actions">
                {actionCards.map((card) => (
                  <Link href={card.href} key={card.href} passHref>
                    <a className="g-action-card">
                      <div className="g-action-ic" style={{ background: card.bg }}>
                        <span style={{ color: card.color }}>{card.icon}</span>
                      </div>
                      <div className="g-action-title">{card.title}</div>
                      <div className="g-action-desc">{card.desc}</div>
                    </a>
                  </Link>
                ))}
              </div>

              <div className="g-vdiv" />

              {/* Stats (passengers only) */}
              {role !== "driver" && (
                <>
                  <div className="g-stats">
                    <div className="g-stat">
                      <div className="g-stat-num">{reservations.length}</div>
                      <div className="g-stat-lbl">Total reservations</div>
                    </div>
                    <div className="g-stat">
                      <div className="g-stat-num">{upcomingReservations.length}</div>
                      <div className="g-stat-lbl">Upcoming trips</div>
                    </div>
                  </div>
                  <div className="g-vdiv" />
                </>
              )}

              {/* Reservations strip */}
              <div className="g-res-strip">
                <div className="g-strip-lbl">My reservations</div>
                <div className="g-strip-list">
                  {reservations.length === 0 ? (
                    <div className="g-strip-empty">No reservations yet.</div>
                  ) : (
                    <>
                      {reservations.slice(0, 3).map((r) => {
                        const isFuture = new Date(r.departureTime) > new Date();
                        return (
                          <div key={r.reservationId} className="g-strip-item" onClick={() => showInMap(r)}>
                            <div className="g-strip-dot" style={{ background: isFuture ? "#16a34a" : "#d1d5db" }} />
                            <div className="g-strip-info">
                              <div className="g-strip-route">
                                {r.departureLocation?.split(",")[0]} → {r.destinationLocation?.split(",")[0]}
                              </div>
                              <div className="g-strip-meta">
                                {r.driver?.firstName} {r.driver?.lastName} · {new Date(r.departureTime).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                            <span className={`g-strip-pill ${isFuture ? "up" : "past"}`}>
                              {isFuture ? "Upcoming" : "Past"}
                            </span>
                          </div>
                        );
                      })}
                      {reservations.length > 3 && (
                        <div className="g-strip-more" onClick={() => setShowReservedRidesModal(true)}>
                          View all {reservations.length} <FaChevronRight size={9} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* MAP */}
            <div className="g-map-row">
              <Map ref={mapRef} location={location} />
              <div className="g-map-pill">
                <div className="g-loc-dot" />
                Your current location
              </div>
            </div>

          </div>
        </main>
      </div>

      {showReservedRidesModal && (
        <ReservedRidesModal
          reservations={reservations}
          onClose={() => setShowReservedRidesModal(false)}
          location={location}
          showInMap={showInMap}
        />
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={({ problemType, problemDetails }) => {
          console.log("Problem Type:", problemType);
          console.log("Problem Details:", problemDetails);
        }}
      />
    </>
  );
};

export default Index;