// pages/index.js
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { FaCar, FaPlusCircle, FaCalendarAlt, FaExclamationTriangle, FaSignOutAlt } from "react-icons/fa";
import Link from "next/link";
import ReservedRidesModal from '../components/ReservedRidesModal';
import ReportModal from "../components/ReportModal";
import { Toaster, toast } from 'sonner';
import Head from "next/head";

// Load Map with no SSR — required for Leaflet
const Map = dynamic(() => import("../components/Map"), { ssr: false });

const Index = () => {
  const mapRef = useRef(null);
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState([3.042048, 36.737626]); // Algiers default
  const [reservations, setReservations] = useState({});
  const [showReservedRidesModal, setShowReservedRidesModal] = useState(false);
  const [counter, setCounter] = useState(0);
  const [role, setRole] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUser({
        role: role,
        id: decodedToken.userId,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
      });
    } catch (error) {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router, role]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation([pos.coords.longitude, pos.coords.latitude]),
      (err) => console.error(err)
    );
  }, []);

  useEffect(() => {
    if (!user || role === 'driver') return;
    const id = setInterval(fetchReservations, 5000);
    return () => clearInterval(id);
  }, [user, role]);

  const fetchReservations = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/apiReservation?userId=${user.id}`);
      const data = await res.json();
      setReservations(data.reservations || {});
      setCounter(prev => {
        const next = data.numberOfReservations;
        if (next > prev) toast.success('You have a new reservation!');
        return next;
      });
    } catch (e) { console.error(e); }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  function showInMap(reservation) {
    if (!mapRef.current) return;
    const dest = `${reservation.destinationLongitude},${reservation.destinationLatitude}`;
    mapRef.current.showPin(dest, reservation.destinationLocation);
    mapRef.current.showRoad(location, dest);
  }

  const navItems = [
    { href: "/search", icon: <FaCar size={16} />, label: "Search Ride", color: "#3b82f6" },
    { href: "/createRide", icon: <FaPlusCircle size={16} />, label: "Create Trip", color: "#8b5cf6" },
    { href: "/see_trips", icon: <FaCalendarAlt size={16} />, label: "All Trips", color: "#06b6d4" },
  ];

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U';

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <Toaster richColors position="top-right" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }

        .idx-root {
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        .idx-sidebar {
          width: 220px;
          flex-shrink: 0;
          background: #1e2235;
          display: flex;
          flex-direction: column;
          z-index: 10;
        }
        .idx-logo {
          padding: 1.4rem 1.25rem 1.2rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .idx-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem; font-weight: 800;
          color: #fff; letter-spacing: -0.02em;
        }
        .idx-logo-text span {
          background: linear-gradient(135deg, #818cf8, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .idx-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          display: flex; flex-direction: column;
          gap: 0.2rem; overflow-y: auto;
        }
        .idx-nav-section {
          font-size: 0.58rem; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          padding: 0.75rem 0.6rem 0.4rem;
        }
        .idx-nav-item {
          display: flex; align-items: center; gap: 0.7rem;
          padding: 0.65rem 0.85rem; border-radius: 8px;
          color: rgba(255,255,255,0.5);
          font-size: 0.845rem; font-weight: 400;
          cursor: pointer; transition: all 0.15s;
          text-decoration: none;
        }
        .idx-nav-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
        .idx-nav-icon {
          width: 30px; height: 30px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .idx-nav-item-accent { background: rgba(129,140,248,0.1); color: #818cf8; }
        .idx-nav-item-accent:hover { background: rgba(129,140,248,0.18); color: #a5b4fc; }

        .idx-sidebar-bottom {
          padding: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; gap: 0.2rem;
        }
        .idx-sidebar-btn {
          display: flex; align-items: center; gap: 0.7rem;
          padding: 0.65rem 0.85rem; border-radius: 8px;
          font-size: 0.845rem; font-weight: 400;
          cursor: pointer; transition: all 0.15s;
          background: transparent; border: none;
          width: 100%; text-align: left;
        }
        .idx-sidebar-btn.report { color: rgba(248,113,113,0.8); }
        .idx-sidebar-btn.report:hover { background: rgba(248,113,113,0.1); color: #f87171; }
        .idx-sidebar-btn.signout { color: rgba(255,255,255,0.3); }
        .idx-sidebar-btn.signout:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); }

        .idx-main {
          flex: 1; display: flex; flex-direction: column;
          overflow: hidden; min-width: 0; min-height: 0;
        }

        .idx-topbar {
          height: 68px; flex-shrink: 0;
          background: #fff; border-bottom: 1px solid #e5e7eb;
          display: flex; align-items: center;
          padding: 0 1.5rem; gap: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .idx-topbar-left { flex: 1; min-width: 0; }
        .idx-greeting {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem; font-weight: 800; color: #111827;
          letter-spacing: -0.01em;
        }
        .idx-greeting span { color: #4f46e5; }
        .idx-sub { font-size: 0.75rem; color: #9ca3af; margin-top: 1px; }

        .idx-topbar-right {
          display: flex; align-items: center;
          gap: 0.65rem; flex-shrink: 0;
        }
        .idx-res-btn {
          position: relative;
          display: flex; align-items: center; gap: 0.45rem;
          padding: 0.5rem 1rem;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 8px; color: #16a34a;
          font-size: 0.78rem; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }
        .idx-res-btn:hover { background: #dcfce7; }
        .idx-badge {
          position: absolute; top: -7px; right: -7px;
          background: #ef4444; color: #fff;
          font-size: 0.58rem; font-weight: 700;
          width: 17px; height: 17px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff;
        }
        .idx-manage-btn {
          display: flex; align-items: center; gap: 0.45rem;
          padding: 0.5rem 1rem;
          background: #eef2ff; border: 1px solid #c7d2fe;
          border-radius: 8px; color: #4f46e5;
          font-size: 0.78rem; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
          text-decoration: none; white-space: nowrap;
        }
        .idx-manage-btn:hover { background: #e0e7ff; }
        .idx-user-chip {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.35rem 0.75rem 0.35rem 0.35rem;
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 100px; cursor: pointer; transition: all 0.15s;
        }
        .idx-user-chip:hover { border-color: #d1d5db; background: #f3f4f6; }
        .idx-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .idx-user-name { font-size: 0.8rem; font-weight: 500; color: #374151; white-space: nowrap; }

        /* MAP — this is the key fix */
        .idx-map-wrapper {
          flex: 1;
          position: relative;
          min-height: 0;
          min-width: 0;
          overflow: hidden;
        }

        .idx-map-pill {
          position: absolute;
          bottom: 1.25rem; left: 1.25rem;
          z-index: 999;
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(255,255,255,0.95);
          border: 1px solid #e5e7eb; border-radius: 100px;
          padding: 0.4rem 0.9rem 0.4rem 0.6rem;
          font-size: 0.75rem; color: #374151;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          pointer-events: none;
        }
        .idx-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 0 2px rgba(22,163,74,0.2);
          flex-shrink: 0;
        }
      `}</style>

      <div className="idx-root">

        {/* SIDEBAR */}
        <aside className="idx-sidebar">
          <div className="idx-logo">
            <div className="idx-logo-text">get<span>right</span></div>
          </div>

          <nav className="idx-nav">
            <div className="idx-nav-section">Navigation</div>
            {navItems.map((item) => (
              <Link href={item.href} key={item.href} passHref>
                <a className="idx-nav-item">
                  <div className="idx-nav-icon" style={{ background: `${item.color}22` }}>
                    <span style={{ color: item.color }}>{item.icon}</span>
                  </div>
                  {item.label}
                </a>
              </Link>
            ))}

            <div className="idx-nav-section">My Trips</div>
            {user && role === 'driver' ? (
              <Link href="/manageProposedDrives" passHref>
                <a className="idx-nav-item idx-nav-item-accent">
                  <div className="idx-nav-icon" style={{ background: 'rgba(129,140,248,0.15)' }}>
                    <FaCalendarAlt size={15} color="#818cf8" />
                  </div>
                  Proposed Trips
                </a>
              </Link>
            ) : (
              <Link href="/proposeDrive" passHref>
                <a className="idx-nav-item idx-nav-item-accent">
                  <div className="idx-nav-icon" style={{ background: 'rgba(129,140,248,0.15)' }}>
                    <FaPlusCircle size={15} color="#818cf8" />
                  </div>
                  Propose a Trip
                </a>
              </Link>
            )}
          </nav>

          <div className="idx-sidebar-bottom">
            <button className="idx-sidebar-btn report" onClick={() => setShowReportModal(true)}>
              <FaExclamationTriangle size={14} /> Report Issue
            </button>
            <button className="idx-sidebar-btn signout" onClick={handleDisconnect}>
              <FaSignOutAlt size={14} /> Sign out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="idx-main">
          <div className="idx-topbar">
            <div className="idx-topbar-left">
              <div className="idx-greeting">
                Welcome back, <span>{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="idx-sub">Here's your ride dashboard</div>
            </div>
            <div className="idx-topbar-right">
              {user && role === 'driver' ? (
                <Link href="/manageDrives" passHref>
                  <a className="idx-manage-btn"><FaCar size={13} /> Manage My Drives</a>
                </Link>
              ) : (
                <button className="idx-res-btn" onClick={() => setShowReservedRidesModal(true)}>
                  {counter > 0 && <span className="idx-badge">{counter}</span>}
                  My Reserved Rides
                </button>
              )}
              <div className="idx-user-chip" onClick={() => router.push('/userProfile')}>
                <div className="idx-avatar">{initials}</div>
                <span className="idx-user-name">{user?.firstName} {user?.lastName}</span>
              </div>
            </div>
          </div>

          {/* MAP WRAPPER — position relative so Map's absolute fill works */}
          <div className="idx-map-wrapper">
            <Map ref={mapRef} location={location} />
            <div className="idx-map-pill">
              <div className="idx-dot" />
              Your current location
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
          console.log('Problem Type:', problemType);
          console.log('Problem Details:', problemDetails);
        }}
      />
    </>
  );
};

export default Index;