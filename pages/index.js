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
  FaChevronRight, FaMap, FaEyeSlash, FaBars,
} from "react-icons/fa";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

const Index = () => {
  const mapRef   = useRef(null);
  const [mounted,                setMounted]                = useState(false);
  const [user,                   setUser]                   = useState(null);
  const [location,               setLocation]               = useState([3.042048, 36.737626]);
  const [reservations,           setReservations]           = useState([]);
  const [showReservedRidesModal, setShowReservedRidesModal] = useState(false);
  const [counter,                setCounter]                = useState(0);
  const [role,                   setRole]                   = useState("");
  const [showReportModal,        setShowReportModal]        = useState(false);
  const [mapVisible,             setMapVisible]             = useState(true);
  const [sidebarOpen,            setSidebarOpen]            = useState(false);
  const router = useRouter();

  // Must be first effect — marks that we're on the client and localStorage is safe to read.
  // Nothing role-dependent renders until this flips, preventing the SSR/client HTML mismatch.
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole || "");
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
      (err)  => console.error(err)
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
      const res  = await fetch(`/api/apiReservation?userId=${user.id}`);
      const data = await res.json();
      setReservations(data.reservations || []);
      setCounter((prev) => {
        const next = data.numberOfReservations;
        if (typeof next === "number" && !isNaN(next) && next > prev)
          toast.success("You have a new reservation!");
        return typeof next === "number" ? next : prev;
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
    if (!mapVisible) setMapVisible(true);
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "U";

  const upcomingReservations = reservations.filter(
    (r) => new Date(r.departureTime) > new Date()
  );

  const isDriver = role === "driver";

  const navLinks = [
    { href: "/search",     label: "Search ride",  icon: <FaSearch size={13} />,     color: "#60a5fa", bg: "rgba(59,130,246,0.13)"  },
    { href: "/createRide", label: "Create trip",  icon: <FaPlusCircle size={13} />, color: "#a78bfa", bg: "rgba(139,92,246,0.13)"  },
    { href: "/see_trips",  label: "All trips",    icon: <FaList size={13} />,       color: "#34d399", bg: "rgba(52,211,153,0.13)"  },
  ];

  const actionCards = [
    { href: "/search",     icon: <FaSearch size={16} />,     color: "#60a5fa", bg: "rgba(59,130,246,0.13)",  title: "Search",    desc: "Find rides near you"  },
    { href: "/createRide", icon: <FaPlusCircle size={16} />, color: "#a78bfa", bg: "rgba(139,92,246,0.13)", title: "Create",    desc: "Offer your seats"     },
    { href: "/see_trips",  icon: <FaList size={16} />,       color: "#34d399", bg: "rgba(52,211,153,0.13)", title: "All trips", desc: "Browse upcoming"      },
    isDriver
      ? { href: "/manageProposedDrives", icon: <FaCalendarAlt size={16} />, color: "#818cf8", bg: "rgba(99,102,241,0.13)", title: "My drives", desc: "Manage proposals" }
      : { href: "/proposeDrive",         icon: <FaMapMarkerAlt size={16}/>, color: "#818cf8", bg: "rgba(99,102,241,0.13)", title: "Propose",   desc: "Request a route"  },
  ];

  // Don't render anything role-dependent until we're on the client.
  // This prevents the SSR HTML (role="") from mismatching the client HTML (role=localStorage value).
  if (!mounted) return null;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Toaster richColors position="top-right" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #0b0d16;
          --surface:   #10121e;
          --surface2:  #181b2e;
          --surface3:  #1e2238;
          --border:    rgba(255,255,255,0.07);
          --border2:   rgba(255,255,255,0.13);
          --text:      #e8eaf6;
          --text2:     #8b90b8;
          --text3:     rgba(255,255,255,0.22);
          --accent:    #6366f1;
          --accent2:   #818cf8;
          --accent-bg: rgba(99,102,241,0.12);
          --green:     #22c55e;
          --green-bg:  rgba(34,197,94,0.11);
          --red:       #f87171;
          --red-bg:    rgba(248,113,113,0.11);
          --radius:    12px;
          --radius-sm: 8px;
          --sidebar-w: 218px;
          --topbar-h:  60px;
          --ease:      cubic-bezier(0.4,0,0.2,1);
        }

        html, body { height: 100%; font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 2px; }

        /* ─── ANIMATIONS ─────────────────────────────── */
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   {
          0%,100% { box-shadow: 0 0 0 2px rgba(34,197,94,0.25); }
          50%      { box-shadow: 0 0 0 5px rgba(34,197,94,0.07); }
        }

        /* ─── LAYOUT ─────────────────────────────────── */
        .g-shell { display:flex; width:100vw; height:100vh; overflow:hidden; position:relative; }

        /* ─── MOBILE OVERLAY ─────────────────────────── */
        .g-overlay {
          display:none; position:fixed; inset:0;
          background:rgba(0,0,0,0.6); z-index:49;
          backdrop-filter:blur(3px); animation:fadeIn 0.18s ease;
        }
        .g-overlay.open { display:block; }

        /* ─── SIDEBAR ────────────────────────────────── */
        .g-sidebar {
          width:var(--sidebar-w); flex-shrink:0;
          background:var(--surface);
          display:flex; flex-direction:column;
          border-right:1px solid var(--border);
          z-index:50;
          transition:transform 0.26s var(--ease);
        }
        .g-logo {
          padding:1.25rem 1.1rem 1rem;
          border-bottom:1px solid var(--border);
          display:flex; align-items:center; gap:0.6rem; flex-shrink:0;
        }
        .g-logo-mark {
          width:30px; height:30px; border-radius:8px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
          box-shadow:0 2px 12px rgba(99,102,241,0.38);
        }
        .g-logo-text {
          font-family:'Bricolage Grotesque',sans-serif;
          font-size:1.05rem; font-weight:800; color:var(--text); letter-spacing:-0.025em;
        }
        .g-logo-text em { color:var(--accent2); font-style:normal; }

        .g-nav { flex:1; padding:0.85rem 0.6rem; display:flex; flex-direction:column; gap:1px; overflow-y:auto; }
        .g-nav-lbl {
          font-size:0.56rem; font-weight:700; letter-spacing:0.16em;
          text-transform:uppercase; color:var(--text3);
          padding:0.8rem 0.6rem 0.3rem;
        }
        .g-nav-a {
          display:flex; align-items:center; gap:0.65rem;
          padding:0.6rem 0.75rem; border-radius:var(--radius-sm);
          color:var(--text2); font-size:0.82rem; font-weight:400;
          text-decoration:none; transition:all 0.15s var(--ease);
          position:relative;
        }
        .g-nav-a:hover { background:rgba(255,255,255,0.055); color:var(--text); }
        .g-nav-a.accent {
          background:var(--accent-bg); color:var(--accent2);
        }
        .g-nav-a.accent::before {
          content:''; position:absolute; left:0; top:22%; bottom:22%;
          width:2.5px; border-radius:2px; background:var(--accent2);
        }
        .g-nav-a.accent:hover { background:rgba(99,102,241,0.2); color:#c7d2fe; }
        .g-nav-ic {
          width:28px; height:28px; border-radius:7px;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }

        .g-sidebar-foot {
          padding:0.6rem; border-top:1px solid var(--border);
          display:flex; flex-direction:column; gap:2px; flex-shrink:0;
        }
        .g-foot-btn {
          display:flex; align-items:center; gap:0.65rem;
          padding:0.6rem 0.75rem; border-radius:var(--radius-sm);
          font-size:0.82rem; font-weight:400; cursor:pointer;
          background:none; border:none; width:100%; text-align:left;
          font-family:'DM Sans',sans-serif; transition:all 0.15s var(--ease);
        }
        .g-foot-btn.danger { color:rgba(248,113,113,0.65); }
        .g-foot-btn.danger:hover { background:var(--red-bg); color:var(--red); }
        .g-foot-btn.muted  { color:var(--text3); }
        .g-foot-btn.muted:hover { background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.5); }

        /* ─── MAIN ───────────────────────────────────── */
        .g-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; background:var(--bg); }

        /* ─── TOPBAR ─────────────────────────────────── */
        .g-topbar {
          height:var(--topbar-h); flex-shrink:0;
          background:var(--surface); border-bottom:1px solid var(--border);
          display:flex; align-items:center; padding:0 1.1rem; gap:0.65rem;
        }
        .g-hamburger {
          display:none; width:34px; height:34px; border-radius:var(--radius-sm);
          background:rgba(255,255,255,0.05); border:1px solid var(--border);
          align-items:center; justify-content:center;
          cursor:pointer; color:var(--text2); flex-shrink:0;
          transition:all 0.15s var(--ease);
        }
        .g-hamburger:hover { background:rgba(255,255,255,0.09); color:var(--text); }
        .g-topbar-info { flex:1; min-width:0; }
        .g-greeting {
          font-family:'Bricolage Grotesque',sans-serif;
          font-size:0.98rem; font-weight:700; color:var(--text);
          letter-spacing:-0.015em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .g-greeting strong { color:var(--accent2); }
        .g-sub { font-size:0.68rem; color:var(--text2); margin-top:1px; }
        .g-topbar-right { margin-left:auto; display:flex; align-items:center; gap:0.5rem; flex-shrink:0; }

        .g-top-btn {
          position:relative; display:flex; align-items:center; gap:0.4rem;
          padding:0.42rem 0.85rem; border-radius:var(--radius-sm);
          font-size:0.76rem; font-weight:500; cursor:pointer;
          font-family:'DM Sans',sans-serif; transition:all 0.15s var(--ease);
          white-space:nowrap; border:1px solid;
        }
        .g-top-btn.green  { background:var(--green-bg); border-color:rgba(34,197,94,0.22);  color:#4ade80; }
        .g-top-btn.green:hover  { background:rgba(34,197,94,0.18); }
        .g-top-btn.indigo { background:var(--accent-bg); border-color:rgba(99,102,241,0.28); color:var(--accent2); text-decoration:none; }
        .g-top-btn.indigo:hover { background:rgba(99,102,241,0.2); }

        .g-badge {
          position:absolute; top:-7px; right:-7px;
          background:var(--red); color:#fff;
          font-size:0.54rem; font-weight:700;
          min-width:16px; height:16px; padding:0 3px; border-radius:100px;
          display:flex; align-items:center; justify-content:center;
          border:2px solid var(--surface);
        }
        .g-chip {
          display:flex; align-items:center; gap:0.45rem;
          padding:0.25rem 0.65rem 0.25rem 0.25rem;
          background:var(--surface2); border:1px solid var(--border2);
          border-radius:100px; cursor:pointer; transition:all 0.15s var(--ease);
        }
        .g-chip:hover { border-color:rgba(255,255,255,0.2); background:var(--surface3); }
        .g-avatar {
          width:28px; height:28px; border-radius:50%;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          display:flex; align-items:center; justify-content:center;
          font-size:0.58rem; font-weight:700; color:#fff; flex-shrink:0;
        }
        .g-chip-name { font-size:0.76rem; font-weight:500; color:var(--text); white-space:nowrap; }

        /* ─── BODY ───────────────────────────────────── */
        .g-body { flex:1; display:flex; flex-direction:column; overflow:hidden; min-height:0; padding:1rem; gap:0.85rem; }
        .g-body > * { animation:slideUp 0.22s ease both; }
        .g-body > *:nth-child(1) { animation-delay:0.04s; }
        .g-body > *:nth-child(2) { animation-delay:0.09s; }
        .g-body > *:nth-child(3) { animation-delay:0.14s; }

        /* ─── TOP ROW ────────────────────────────────── */
        .g-top-row { display:flex; gap:0.85rem; align-items:flex-start; flex-shrink:0; }

        /* ─── ACTION CARDS ───────────────────────────── */
        .g-actions { display:flex; gap:0.6rem; flex-shrink:0; }
        .g-action-card {
          background:var(--surface); border:1px solid var(--border);
          border-radius:var(--radius); padding:0.9rem 0.85rem 0.8rem;
          display:flex; flex-direction:column; gap:0.4rem;
          text-decoration:none; transition:all 0.18s var(--ease);
          width:114px; flex-shrink:0; position:relative; overflow:hidden;
        }
        .g-action-card::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,0.03),transparent 55%);
          pointer-events:none;
        }
        .g-action-card:hover {
          border-color:var(--border2); background:var(--surface2);
          transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.32);
        }
        .g-action-card:active { transform:translateY(0); }
        .g-action-ic { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .g-action-title { font-family:'Bricolage Grotesque',sans-serif; font-size:0.8rem; font-weight:700; color:var(--text); letter-spacing:-0.01em; }
        .g-action-desc { font-size:0.64rem; color:var(--text2); line-height:1.35; }

        /* ─── DIVIDER ────────────────────────────────── */
        .g-vdiv { width:1px; background:var(--border); align-self:stretch; flex-shrink:0; }

        /* ─── STATS ──────────────────────────────────── */
        .g-stats { display:flex; flex-direction:column; gap:0.5rem; flex-shrink:0; }
        .g-stat {
          background:var(--surface); border:1px solid var(--border);
          border-radius:var(--radius); padding:0.75rem 1rem; min-width:112px;
          position:relative; overflow:hidden;
        }
        .g-stat::after {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,var(--accent),transparent 70%);
        }
        .g-stat-num { font-family:'Bricolage Grotesque',sans-serif; font-size:1.6rem; font-weight:800; color:var(--text); line-height:1; letter-spacing:-0.035em; }
        .g-stat-lbl { font-size:0.63rem; color:var(--text2); margin-top:4px; }

        /* ─── RESERVATION STRIP ──────────────────────── */
        .g-res-strip { flex:1; display:flex; flex-direction:column; min-width:0; }
        .g-strip-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem; }
        .g-strip-lbl { font-size:0.59rem; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:var(--text3); }
        .g-strip-more { font-size:0.7rem; color:var(--accent2); font-weight:500; cursor:pointer; display:flex; align-items:center; gap:3px; transition:color 0.14s; }
        .g-strip-more:hover { color:#c7d2fe; }
        .g-strip-list { display:flex; flex-direction:column; gap:0.4rem; }
        .g-strip-item {
          background:var(--surface); border:1px solid var(--border);
          border-radius:var(--radius-sm); padding:0.6rem 0.85rem;
          display:flex; align-items:center; gap:0.7rem;
          cursor:pointer; transition:all 0.15s var(--ease);
        }
        .g-strip-item:hover { border-color:rgba(99,102,241,0.3); background:var(--surface2); }
        .g-strip-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
        .g-strip-info { flex:1; min-width:0; }
        .g-strip-route { font-size:0.78rem; font-weight:500; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .g-strip-meta  { font-size:0.64rem; color:var(--text2); margin-top:1px; }
        .g-strip-pill  { font-size:0.6rem; font-weight:600; padding:2px 8px; border-radius:100px; flex-shrink:0; }
        .g-strip-pill.up   { background:var(--green-bg); color:#4ade80; }
        .g-strip-pill.past { background:rgba(255,255,255,0.05); color:var(--text2); }
        .g-strip-empty { font-size:0.78rem; color:var(--text2); background:var(--surface); border:1px dashed var(--border2); border-radius:var(--radius-sm); padding:0.75rem 1rem; }

        /* ─── MAP SECTION ────────────────────────────── */
        .g-map-section { flex:1; min-height:0; display:flex; flex-direction:column; }

        .g-map-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem; flex-shrink:0; }
        .g-map-title { font-size:0.59rem; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:var(--text3); display:flex; align-items:center; gap:0.4rem; }
        .g-map-toggle {
          display:flex; align-items:center; gap:0.4rem;
          padding:0.32rem 0.8rem; background:var(--surface);
          border:1px solid var(--border); border-radius:100px;
          color:var(--text2); font-size:0.7rem; font-weight:500; cursor:pointer;
          transition:all 0.15s var(--ease); font-family:'DM Sans',sans-serif;
        }
        .g-map-toggle:hover { border-color:var(--border2); color:var(--text); background:var(--surface2); }

        .g-map-row {
          flex:1; min-height:0; border-radius:var(--radius);
          overflow:hidden; border:1px solid var(--border);
          position:relative; isolation:isolate;
        }
        .g-map-pill {
          position:absolute; bottom:12px; left:12px; z-index:999;
          background:rgba(16,18,30,0.9); border:1px solid var(--border2);
          border-radius:100px; padding:4px 10px 4px 7px;
          font-size:0.68rem; color:var(--text2);
          display:flex; align-items:center; gap:5px;
          box-shadow:0 2px 10px rgba(0,0,0,0.4);
          pointer-events:none; backdrop-filter:blur(8px);
        }
        .g-loc-dot {
          width:7px; height:7px; border-radius:50%;
          background:var(--green); flex-shrink:0;
          animation:pulse 2.2s ease infinite;
        }

        /* ─── COLLAPSED MAP ──────────────────────────── */
        .g-map-collapsed {
          background:var(--surface); border:1px dashed var(--border2);
          border-radius:var(--radius); padding:0.9rem 1.1rem;
          display:flex; align-items:center; justify-content:space-between;
          cursor:pointer; transition:all 0.15s var(--ease);
          animation:slideUp 0.2s ease;
        }
        .g-map-collapsed:hover { background:var(--surface2); border-color:rgba(99,102,241,0.35); }
        .g-map-coll-left { display:flex; align-items:center; gap:0.7rem; }
        .g-map-coll-ic { width:36px; height:36px; border-radius:9px; background:var(--accent-bg); display:flex; align-items:center; justify-content:center; color:var(--accent2); }
        .g-map-coll-title { font-size:0.82rem; font-weight:500; color:var(--text2); }
        .g-map-coll-sub   { font-size:0.65rem; color:var(--text3); margin-top:1px; }
        .g-map-coll-cta   { font-size:0.72rem; color:var(--accent2); font-weight:500; display:flex; align-items:center; gap:0.3rem; }

        /* ─── RESPONSIVE ─────────────────────────────── */
        @media (max-width: 900px) {
          .g-sidebar { position:fixed; top:0; left:0; bottom:0; transform:translateX(-100%); }
          .g-sidebar.open { transform:translateX(0); }
          .g-hamburger { display:flex; }
          .g-chip-name { display:none; }
          .g-vdiv { display:none; }
          .g-stats { flex-direction:row; }
          .g-stat  { min-width:85px; }
          .g-top-row { flex-wrap:wrap; }
          .g-actions { flex-wrap:wrap; }
          .g-action-card { width:calc(50% - 0.3rem); }
          .g-res-strip { width:100%; }
        }

        @media (max-width: 560px) {
          :root { --topbar-h:56px; }
          .g-body { padding:0.65rem; gap:0.65rem; }
          .g-top-row { flex-direction:column; gap:0.6rem; }
          .g-actions { display:grid; grid-template-columns:1fr 1fr; width:100%; }
          .g-action-card { width:100%; }
          .g-stats { flex-direction:row; width:100%; }
          .g-stat  { flex:1; min-width:0; }
          .g-stat-num { font-size:1.35rem; }
          .g-top-btn span.label { display:none; }
          .g-top-btn { padding:0.42rem 0.65rem; }
          .g-greeting { font-size:0.88rem; }
          .g-sub { display:none; }
          .g-map-collapsed { padding:0.75rem 0.85rem; }
        }
      `}</style>

      {/* Mobile overlay */}
      <div className={`g-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      <div className="g-shell" suppressHydrationWarning={true}>

        {/* ── SIDEBAR ── */}
        <aside className={`g-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="g-logo">
            <div className="g-logo-mark">
              <svg viewBox="0 0 16 16" style={{ width: 14, height: 14, fill: "#fff" }}>
                <path d="M8 1L1 5.5v5L8 15l7-4.5v-5L8 1zm0 2.2l4.5 2.9L8 9l-4.5-2.9L8 3.2z" />
              </svg>
            </div>
            <div className="g-logo-text">get<em>right</em></div>
          </div>

          <nav className="g-nav">
            <div className="g-nav-lbl">Navigation</div>
            {navLinks.map((n) => (
              <Link href={n.href} key={n.href} passHref>
                <a className="g-nav-a" onClick={() => setSidebarOpen(false)}>
                  <div className="g-nav-ic" style={{ background: n.bg }}>
                    <span style={{ color: n.color }}>{n.icon}</span>
                  </div>
                  {n.label}
                </a>
              </Link>
            ))}

            <div className="g-nav-lbl">My trips</div>
            {isDriver ? (
              <Link href="/manageProposedDrives" passHref>
                <a className="g-nav-a accent" onClick={() => setSidebarOpen(false)}>
                  <div className="g-nav-ic" style={{ background: "rgba(99,102,241,0.13)" }}>
                    <FaCalendarAlt size={13} color="#818cf8" />
                  </div>
                  Proposed trips
                </a>
              </Link>
            ) : (
              <Link href="/proposeDrive" passHref>
                <a className="g-nav-a accent" onClick={() => setSidebarOpen(false)}>
                  <div className="g-nav-ic" style={{ background: "rgba(99,102,241,0.13)" }}>
                    <FaMapMarkerAlt size={13} color="#818cf8" />
                  </div>
                  Propose a trip
                </a>
              </Link>
            )}
          </nav>

          <div className="g-sidebar-foot">
            <button className="g-foot-btn danger" onClick={() => { setShowReportModal(true); setSidebarOpen(false); }}>
              <FaExclamationTriangle size={13} /> Report issue
            </button>
            <button className="g-foot-btn muted" onClick={handleDisconnect}>
              <FaSignOutAlt size={13} /> Sign out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="g-main">
          <div className="g-topbar">
            <button className="g-hamburger" onClick={() => setSidebarOpen(true)}>
              <FaBars size={14} />
            </button>
            <div className="g-topbar-info">
              <div className="g-greeting">
                Welcome back, <strong>{user?.firstName} {user?.lastName}</strong>
              </div>
              <div className="g-sub">Your ride dashboard</div>
            </div>
            <div className="g-topbar-right">
              {isDriver ? (
                <Link href="/manageDrives" passHref>
                  <a className="g-top-btn indigo">
                    <FaCar size={12} /> <span className="label">Manage drives</span>
                  </a>
                </Link>
              ) : (
                <button className="g-top-btn green" onClick={() => setShowReservedRidesModal(true)}>
                  {counter > 0 && <span className="g-badge">{counter}</span>}
                  <FaTicketAlt size={12} /> <span className="label">Reservations</span>
                </button>
              )}
              <div className="g-chip" onClick={() => router.push("/userProfile")}>
                <div className="g-avatar">{initials}</div>
                <span className="g-chip-name">{user?.firstName} {user?.lastName}</span>
              </div>
            </div>
          </div>

          <div className="g-body">

            {/* ── TOP ROW ── */}
            <div className="g-top-row">
              {/* Action cards */}
              <div className="g-actions">
                {actionCards.map((card, i) => (
                  <Link href={card.href} key={i} passHref>
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

              {/* Stats — passengers only */}
              {!isDriver && (
                <>
                  <div className="g-stats">
                    <div className="g-stat">
                      <div className="g-stat-num">{reservations.length}</div>
                      <div className="g-stat-lbl">Total</div>
                    </div>
                    <div className="g-stat">
                      <div className="g-stat-num">{upcomingReservations.length}</div>
                      <div className="g-stat-lbl">Upcoming</div>
                    </div>
                  </div>
                  <div className="g-vdiv" />
                </>
              )}

              {/* Reservation strip */}
              <div className="g-res-strip">
                <div className="g-strip-hd">
                  <div className="g-strip-lbl">My reservations</div>
                  {reservations.length > 3 && (
                    <div className="g-strip-more" onClick={() => setShowReservedRidesModal(true)}>
                      View all {reservations.length} <FaChevronRight size={9} />
                    </div>
                  )}
                </div>
                <div className="g-strip-list">
                  {reservations.length === 0 ? (
                    <div className="g-strip-empty">No reservations yet.</div>
                  ) : (
                    reservations.slice(0, 3).map((r) => {
                      const isFuture = new Date(r.departureTime) > new Date();
                      return (
                        <div key={r.reservationId} className="g-strip-item" onClick={() => showInMap(r)}>
                          <div className="g-strip-dot" style={{ background: isFuture ? "var(--green)" : "rgba(255,255,255,0.15)" }} />
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
                    })
                  )}
                </div>
              </div>
            </div>

            {/* ── MAP SECTION ── */}
            {mapVisible ? (
              <div className="g-map-section">
                <div className="g-map-hd">
                  <div className="g-map-title"><FaMap size={9} /> Live map</div>
                  <button className="g-map-toggle" onClick={() => setMapVisible(false)}>
                    <FaEyeSlash size={11} /> Hide map
                  </button>
                </div>
                <div className="g-map-row">
                  <Map ref={mapRef} location={location} />
                  <div className="g-map-pill">
                    <div className="g-loc-dot" />
                    Your current location
                  </div>
                </div>
              </div>
            ) : (
              <div className="g-map-collapsed" onClick={() => setMapVisible(true)}>
                <div className="g-map-coll-left">
                  <div className="g-map-coll-ic"><FaMap size={15} /></div>
                  <div>
                    <div className="g-map-coll-title">Map is hidden</div>
                    <div className="g-map-coll-sub">Tap to show your location on the map</div>
                  </div>
                </div>
                <div className="g-map-coll-cta"><FaMap size={11} /> Show map <FaChevronRight size={10} /></div>
              </div>
            )}

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