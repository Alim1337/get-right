// pages/index.js
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Map from "../components/Map";
import { FaCar, FaPlusCircle, FaCalendarAlt, FaExclamationTriangle, FaSignOutAlt, FaUser } from "react-icons/fa";
import Link from "next/link";
import ReservedRidesModal from '../components/ReservedRidesModal';
import ReportModal from "../components/ReportModal";
import { Toaster, toast } from 'sonner';
import Head from "next/head";

const Index = () => {
  const mapRef = useRef(null);
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState([44, 36.2]);
  const [hasReservations, setHasReservations] = useState(false);
  const router = useRouter();
  const [reservations, setReservations] = useState({});
  const [showReservedRidesModal, setShowReservedRidesModal] = useState(false);
  const [counter, setCounter] = useState(0);
  const [role, setRole] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUser({
          role: role,
          id: decodedToken.userId,
          firstName: decodedToken.firstName,
          lastName: decodedToken.lastName,
          photoUrl: 'userImage/userProfile.jpg'
        });
      } catch (error) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    }
  }, [router, role]);

  useEffect(() => {
    const intervalCleanup = fetchReservationsPeriodically();
    return () => clearInterval(intervalCleanup);
  }, [user]);

  const fetchReservationsPeriodically = () => {
    if (user && role === 'driver') return;
    const intervalId = setInterval(async () => {
      try { await fetchReservations(); } catch (error) { console.error(error); }
    }, 1000);
    return () => clearInterval(intervalId);
  };

  const fetchReservations = async () => {
    if (!user || !user.id) return;
    try {
      const response = await fetch(`/api/apiReservation?userId=${user.id}`);
      const data = await response.json();
      if (data.reservations) setReservations(data.reservations);
      else setReservations({});
      setHasReservations(data.hasReservations);
      setCounter((prevCounter) => {
        const newCounter = data.numberOfReservations;
        if (newCounter > prevCounter) toast.success('You have a new reservation!');
        return newCounter;
      });
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    const updateLocation = async () => {
      try {
        const position = await getCurrentLocation();
        setLocation([position.coords.longitude, position.coords.latitude]);
      } catch (error) { console.error(error); }
    };
    updateLocation();
  }, []);

  const getCurrentLocation = () => new Promise((resolve, reject) => {
    const watchId = navigator.geolocation.watchPosition(resolve, reject);
    setTimeout(() => navigator.geolocation.clearWatch(watchId), 3000);
  });

  const handleDisconnect = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  function showInMap(reservations) {
    if (!mapRef.current) return;
    const destinationLocationString = `${reservations.destinationLongitude},${reservations.destinationLatitude}`;
    mapRef.current.showPin(destinationLocationString, reservations.destinationLocation);
    mapRef.current.showRoad(location, destinationLocationString);
  }

  const navItems = [
    { href: "/search", icon: <FaCar size={18} />, label: "Search Ride" },
    { href: "/createRide", icon: <FaPlusCircle size={18} />, label: "Create Trip" },
    { href: "/see_trips", icon: <FaCalendarAlt size={18} />, label: "All Trips" },
  ];

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <Toaster richColors position="top-right" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0d0d12; }

        .idx-root {
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #0d0d12;
        }

        /* SIDEBAR */
        .idx-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: #111118;
          border-right: 1px solid #1c1c28;
          display: flex;
          flex-direction: column;
          padding: 0;
          z-index: 10;
        }

        .idx-logo {
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid #1c1c28;
        }
        .idx-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 1.3rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .idx-logo-text span {
          background: linear-gradient(135deg, #7c5cfc, #14b478);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .idx-nav {
          flex: 1;
          padding: 1.25rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .idx-nav-label {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #333;
          padding: 0 0.75rem;
          margin-bottom: 0.5rem;
          margin-top: 0.5rem;
        }

        .idx-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.9rem;
          border-radius: 8px;
          color: #666;
          font-size: 0.875rem;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
          border: 1px solid transparent;
        }
        .idx-nav-item:hover {
          background: #1a1a24;
          color: #fff;
          border-color: #1c1c28;
        }
        .idx-nav-item svg { flex-shrink: 0; }

        .idx-nav-item-special {
          background: rgba(124,92,252,0.08);
          color: #7c5cfc;
          border-color: rgba(124,92,252,0.2);
        }
        .idx-nav-item-special:hover {
          background: rgba(124,92,252,0.15);
          color: #9b7fff;
        }

        .idx-sidebar-bottom {
          padding: 1rem 0.75rem;
          border-top: 1px solid #1c1c28;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .idx-btn-report {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.7rem 0.9rem;
          border-radius: 8px;
          color: #e05252;
          font-size: 0.875rem;
          font-weight: 400;
          background: rgba(224,82,82,0.06);
          border: 1px solid rgba(224,82,82,0.15);
          cursor: pointer;
          transition: all 0.15s;
          width: 100%;
          text-align: left;
        }
        .idx-btn-report:hover { background: rgba(224,82,82,0.12); color: #ff6b6b; }

        .idx-btn-disconnect {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.7rem 0.9rem;
          border-radius: 8px;
          color: #555;
          font-size: 0.875rem;
          background: transparent;
          border: 1px solid #1c1c28;
          cursor: pointer;
          transition: all 0.15s;
          width: 100%;
          text-align: left;
        }
        .idx-btn-disconnect:hover { border-color: #333; color: #ccc; }

        /* MAIN */
        .idx-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* TOPBAR */
        .idx-topbar {
          height: 64px;
          flex-shrink: 0;
          background: #111118;
          border-bottom: 1px solid #1c1c28;
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          gap: 1rem;
        }

        .idx-topbar-left { flex: 1; }
        .idx-page-title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.01em;
        }
        .idx-page-sub { font-size: 0.75rem; color: #444; margin-top: 1px; }

        .idx-topbar-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .idx-reservations-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(20,180,120,0.08);
          border: 1px solid rgba(20,180,120,0.2);
          border-radius: 8px;
          color: #14b478;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .idx-reservations-btn:hover { background: rgba(20,180,120,0.15); }

        .idx-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #e05252;
          color: #fff;
          font-size: 0.6rem;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #111118;
        }

        .idx-manage-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(124,92,252,0.08);
          border: 1px solid rgba(124,92,252,0.2);
          border-radius: 8px;
          color: #7c5cfc;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
        }
        .idx-manage-btn:hover { background: rgba(124,92,252,0.15); }

        .idx-user-chip {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.4rem 0.75rem 0.4rem 0.4rem;
          background: #1a1a24;
          border: 1px solid #1c1c28;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .idx-user-chip:hover { border-color: #333; }

        .idx-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c5cfc, #14b478);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }
        .idx-user-name {
          font-size: 0.8rem;
          font-weight: 500;
          color: #ccc;
        }

        /* MAP AREA */
        .idx-map-area {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        /* MAP OVERLAY CARDS */
        .idx-map-overlay {
          position: absolute;
          bottom: 1.5rem;
          left: 1.5rem;
          z-index: 5;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .idx-location-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(17,17,24,0.9);
          border: 1px solid #1c1c28;
          border-radius: 100px;
          padding: 0.4rem 0.9rem;
          font-size: 0.75rem;
          color: #888;
          backdrop-filter: blur(8px);
        }
        .idx-location-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #14b478;
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
            <div className="idx-nav-label">Navigate</div>

            {navItems.map((item) => (
              <Link href={item.href} key={item.href} passHref>
                <a className="idx-nav-item">
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            ))}

            <div className="idx-nav-label" style={{ marginTop: '1rem' }}>Trips</div>

            {user && role === 'driver' ? (
              <Link href="/manageProposedDrives" passHref>
                <a className="idx-nav-item idx-nav-item-special">
                  <FaCalendarAlt size={18} />
                  Proposed Trips
                </a>
              </Link>
            ) : (
              <Link href="/proposeDrive" passHref>
                <a className="idx-nav-item idx-nav-item-special">
                  <FaPlusCircle size={18} />
                  Propose a Trip
                </a>
              </Link>
            )}
          </nav>

          <div className="idx-sidebar-bottom">
            <button className="idx-btn-report" onClick={() => setShowReportModal(true)}>
              <FaExclamationTriangle size={14} />
              Report Issue
            </button>
            <button className="idx-btn-disconnect" onClick={handleDisconnect}>
              <FaSignOutAlt size={14} />
              Sign out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="idx-main">

          {/* TOPBAR */}
          <div className="idx-topbar">
            <div className="idx-topbar-left">
              <div className="idx-page-title">Dashboard</div>
              <div className="idx-page-sub">Welcome back{user ? `, ${user.firstName}` : ''}</div>
            </div>

            <div className="idx-topbar-right">
              {user && role === 'driver' ? (
                <Link href="/manageDrives" passHref>
                  <a className="idx-manage-btn">
                    <FaCar size={13} />
                    Manage My Drives
                  </a>
                </Link>
              ) : (
                <button className="idx-reservations-btn" onClick={() => setShowReservedRidesModal(true)}>
                  {counter > 0 && <span className="idx-badge">{counter}</span>}
                  My Reserved Rides
                </button>
              )}

              <div
                className="idx-user-chip"
                onClick={() => router.push('/userProfile')}
              >
                <div className="idx-avatar">
                  {user ? `${user.firstName?.[0]}${user.lastName?.[0]}` : 'U'}
                </div>
                <span className="idx-user-name">
                  {user ? `${user.firstName} ${user.lastName}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* MAP */}
          <div className="idx-map-area">
            <Map ref={mapRef} location={location} />

            <div className="idx-map-overlay">
              <div className="idx-location-chip">
                <div className="idx-location-dot" />
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
          console.log('Problem Type:', problemType);
          console.log('Problem Details:', problemDetails);
        }}
      />
    </>
  );
};

export default Index;