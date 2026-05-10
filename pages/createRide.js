import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaChair, FaRoute, FaCrosshairs } from "react-icons/fa";
import { toast } from 'sonner';
import Head from "next/head";

const CreateRide = () => {
  const router = useRouter();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  // Use ref so the map click handler always reads the latest value
  const clickModeRef = useRef('destination');

  const [driverId, setDriverId] = useState('');
  const [maxSeatsPerTrip, setMaxSeatsPerTrip] = useState(4);
  const [rideDetails, setRideDetails] = useState({ date: '', time: '', seatsAvailable: 1 });
  const [pickup, setPickup] = useState({ coordinates: [0, 0], locationName: "" });
  const [dropoff, setDropoff] = useState({ coordinates: [0, 0], locationName: "" });
  const [loading, setLoading] = useState(false);
  const [clickMode, setClickMode] = useState('destination'); // only for UI display

  // Keep a ref to the Leaflet L object and makeIcon so we can reuse
  const LRef = useRef(null);
  const makeIconRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const decoded = JSON.parse(atob(token.split('.')[1]));
    setDriverId(decoded.userId);
  }, []);

  useEffect(() => {
    fetch('/api/getMaxSeatsPerTrip')
      .then(r => r.json())
      .then(d => setMaxSeatsPerTrip(d.maxSeatsPerTrip || 4))
      .catch(() => setMaxSeatsPerTrip(4));
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const redrawLine = (pickupLatLng, destLatLng) => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !pickupLatLng || !destLatLng) return;
    if (routeLineRef.current) routeLineRef.current.remove();
    const line = L.polyline(
      [[pickupLatLng.lat, pickupLatLng.lng], [destLatLng.lat, destLatLng.lng]],
      { color: '#4f46e5', weight: 3, opacity: 0.8, dashArray: '8,4' }
    ).addTo(map);
    routeLineRef.current = line;
    map.fitBounds(line.getBounds(), { padding: [50, 50] });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      if (mapRef.current) return;
      LRef.current = L;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const makeIcon = (color, label) => L.divIcon({
        className: '',
        html: `<div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:16px;height:16px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
          <div style="background:${color};color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px;margin-top:2px;white-space:nowrap;">${label}</div>
        </div>`,
        iconSize: [50, 34],
        iconAnchor: [25, 8],
        popupAnchor: [0, -10],
      });
      makeIconRef.current = makeIcon;

      const map = L.map(mapContainerRef.current).setView([36.7, 3.0], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;

      // Auto-detect pickup location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const name = await reverseGeocode(lat, lng);
          map.setView([lat, lng], 14);
          if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
          pickupMarkerRef.current = L.marker([lat, lng], { icon: makeIcon('#4f46e5', 'PICKUP') })
            .addTo(map)
            .bindPopup(`<b>Pickup:</b><br/>${name}`);
          setPickup({ coordinates: [lng, lat], locationName: name });
        }, err => console.error(err));
      }

      // MAP CLICK — reads clickModeRef to decide what to do
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        const mode = clickModeRef.current; // ALWAYS read from ref, not state
        const name = await reverseGeocode(lat, lng);

        if (mode === 'pickup') {
          // ── Set PICKUP ──
          if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
          pickupMarkerRef.current = L.marker([lat, lng], { icon: makeIcon('#4f46e5', 'PICKUP') })
            .addTo(map)
            .bindPopup(`<b>Pickup:</b><br/>${name}`)
            .openPopup();
          setPickup({ coordinates: [lng, lat], locationName: name });
          // Redraw line if destination already set
          if (destMarkerRef.current) {
            redrawLine({ lat, lng }, destMarkerRef.current.getLatLng());
          }
          // Auto switch back to destination mode
          clickModeRef.current = 'destination';
          setClickMode('destination');
          toast.success('Pickup location updated!');

        } else {
          // ── Set DESTINATION ──
          if (destMarkerRef.current) destMarkerRef.current.remove();
          destMarkerRef.current = L.marker([lat, lng], { icon: makeIcon('#ef4444', 'DESTINATION') })
            .addTo(map)
            .bindPopup(`<b>Destination:</b><br/>${name}`)
            .openPopup();
          setDropoff({ coordinates: [lng, lat], locationName: name });
          // Draw line if pickup already set
          if (pickupMarkerRef.current) {
            redrawLine(pickupMarkerRef.current.getLatLng(), { lat, lng });
          }
        }
      });
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  const switchToPickupMode = () => {
    clickModeRef.current = 'pickup';
    setClickMode('pickup');
    toast('Click on the map to set your new pickup location', { icon: '📍' });
  };

  const cancelPickupMode = () => {
    clickModeRef.current = 'destination';
    setClickMode('destination');
  };

  const resetToCurrentLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    const L = LRef.current;
    const makeIcon = makeIconRef.current;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const name = await reverseGeocode(lat, lng);
      mapRef.current.setView([lat, lng], 14);
      if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
      pickupMarkerRef.current = L.marker([lat, lng], { icon: makeIcon('#4f46e5', 'PICKUP') })
        .addTo(mapRef.current)
        .bindPopup(`<b>Pickup:</b><br/>${name}`)
        .openPopup();
      setPickup({ coordinates: [lng, lat], locationName: name });
      if (destMarkerRef.current) {
        redrawLine({ lat, lng }, destMarkerRef.current.getLatLng());
      }
      clickModeRef.current = 'destination';
      setClickMode('destination');
      toast.success('Reset to your current location!');
    }, err => toast.error('Could not get your location'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickup.locationName) { toast.error('Please set a pickup location'); return; }
    if (!dropoff.locationName) { toast.error('Please click on the map to set a destination'); return; }
    if (!rideDetails.date || !rideDetails.time) { toast.error('Please fill in date and time'); return; }
    setLoading(true);
    // Read driverId fresh from token at submit time to avoid stale state
    let currentDriverId = driverId;
    try {
      const tkn = localStorage.getItem('token');
      if (tkn) {
        const dec = JSON.parse(atob(tkn.split('.')[1]));
        currentDriverId = dec.userId;
      }
    } catch(e) { console.error('token decode error', e); }
    try {
      const res = await fetch('/api/apiCreateRide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departure: pickup.locationName,
          destination: dropoff.locationName,
          date: rideDetails.date,
          time: rideDetails.time,
          seatsAvailable: rideDetails.seatsAvailable,
          driverId: currentDriverId,
          departureLatitude: pickup.coordinates[1],
          departureLongitude: pickup.coordinates[0],
          destinationLatitude: dropoff.coordinates[1],
          destinationLongitude: dropoff.coordinates[0],
        }),
      });
      if (res.ok) {
        localStorage.setItem('role', 'driver');
        toast.success('Trip created successfully!');
        router.push('/');
      } else {
        toast.error('Failed to create trip. Please try again.');
      }
    } catch { toast.error('An error occurred.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f5f6fa; }
        .cr-root { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
        .cr-topbar {
          height: 60px; flex-shrink: 0; background: #1e2235;
          display: flex; align-items: center; padding: 0 1.25rem; gap: 1rem;
        }
        .cr-back {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 8px;
          background: rgba(255,255,255,0.08); border: none;
          color: #fff; cursor: pointer; transition: all 0.15s; text-decoration: none;
        }
        .cr-back:hover { background: rgba(255,255,255,0.15); }
        .cr-topbar-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #fff; }
        .cr-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }
        .cr-form-col {
          width: 360px; flex-shrink: 0; background: #fff;
          border-right: 1px solid #e5e7eb; overflow-y: auto;
          padding: 1.5rem; display: flex; flex-direction: column; gap: 1.1rem;
        }
        .cr-form-title { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700; color: #111827; }
        .cr-form-sub { font-size: 0.8rem; color: #9ca3af; margin-top: 0.2rem; }
        .cr-hint {
          display: flex; align-items: flex-start; gap: 0.5rem;
          background: #eef2ff; border: 1px solid #c7d2fe;
          border-radius: 8px; padding: 0.65rem 0.85rem;
          font-size: 0.78rem; color: #4f46e5; line-height: 1.5;
        }
        .cr-hint-pickup {
          display: flex; align-items: flex-start; gap: 0.5rem;
          background: #fef3c7; border: 1px solid #fde68a;
          border-radius: 8px; padding: 0.65rem 0.85rem;
          font-size: 0.78rem; color: #92400e; line-height: 1.5;
        }
        .cr-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .cr-label {
          font-size: 0.7rem; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.07em;
          display: flex; align-items: center; gap: 4px;
        }
        .cr-input {
          width: 100%; padding: 0.7rem 0.9rem;
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 8px; font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif; color: #111827;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .cr-input[readonly] { color: #6b7280; cursor: default; background: #f3f4f6; }
        .cr-input::placeholder { color: #d1d5db; }
        .cr-input.pickup-active { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.12); }
        .cr-pickup-actions { display: flex; gap: 0.5rem; }
        .cr-btn-sm {
          flex: 1; padding: 0.48rem 0.75rem;
          border-radius: 7px; font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 5px;
          border: 1px solid;
        }
        .cr-btn-change { background: #eef2ff; color: #4f46e5; border-color: #c7d2fe; }
        .cr-btn-change:hover { background: #e0e7ff; }
        .cr-btn-change.active { background: #fef3c7; color: #92400e; border-color: #fde68a; }
        .cr-btn-gps { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
        .cr-btn-gps:hover { background: #dcfce7; }
        .cr-btn-cancel { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
        .cr-btn-cancel:hover { background: #fee2e2; }
        .cr-row { display: flex; gap: 0.75rem; }
        .cr-row .cr-field { flex: 1; }
        .cr-seats-info {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 0.72rem; color: #9ca3af;
        }
        .cr-submit {
          width: 100%; padding: 0.85rem; background: #4f46e5; color: #fff;
          border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 500; cursor: pointer;
          transition: background 0.15s; margin-top: auto;
        }
        .cr-submit:hover { background: #4338ca; }
        .cr-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .cr-map-col { flex: 1; position: relative; overflow: hidden; min-height: 0; }
        .cr-map-inner { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .leaflet-container { width: 100%; height: 100%; }
        .cr-map-badge {
          position: absolute; bottom: 1rem; left: 50%;
          transform: translateX(-50%);
          border-radius: 100px; padding: 0.4rem 1rem;
          font-size: 0.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          white-space: nowrap; z-index: 999; pointer-events: none;
          border: 1px solid;
        }
        .cr-map-badge.dest { background: rgba(255,255,255,0.95); border-color: #e5e7eb; color: #6b7280; }
        .cr-map-badge.pickup { background: #fef3c7; border-color: #fde68a; color: #92400e; font-weight: 600; }
      `}</style>

<div className="cr-root" suppressHydrationWarning={true}>
        <div className="cr-topbar">
          <Link href="/" passHref><a className="cr-back"><BsArrowLeft size={16} /></a></Link>
          <div className="cr-topbar-title">Create a Trip</div>
        </div>

        <div className="cr-body">
          <div className="cr-form-col">
            <div>
              <div className="cr-form-title">Trip Details</div>
              <div className="cr-form-sub">Set your route and schedule</div>
            </div>

            {/* Mode hint */}
            {clickMode === 'pickup' ? (
              <div className="cr-hint-pickup">
                <FaMapMarkerAlt size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Click anywhere on the map to set your new pickup location.</span>
              </div>
            ) : (
              <div className="cr-hint">
                <FaRoute size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Click the map to set your <b>destination</b>. Use the buttons below to change your pickup.</span>
              </div>
            )}

            {/* PICKUP */}
            <div className="cr-field">
              <div className="cr-label"><FaMapMarkerAlt size={10} color="#4f46e5" /> Pickup Location</div>
              <input
                className={`cr-input ${clickMode === 'pickup' ? 'pickup-active' : ''}`}
                type="text" readOnly
                value={pickup.locationName}
                placeholder="Detecting your location…"
              />
              <div className="cr-pickup-actions">
                {clickMode === 'pickup' ? (
                  <button className="cr-btn-sm cr-btn-cancel" onClick={cancelPickupMode}>
                    ✕ Cancel
                  </button>
                ) : (
                  <button className="cr-btn-sm cr-btn-change" onClick={switchToPickupMode}>
                    <FaMapMarkerAlt size={11} /> Change pickup
                  </button>
                )}
                <button className="cr-btn-sm cr-btn-gps" onClick={resetToCurrentLocation}>
                  <FaCrosshairs size={11} /> My location
                </button>
              </div>
            </div>

            {/* DESTINATION */}
            <div className="cr-field">
              <div className="cr-label"><FaMapMarkerAlt size={10} color="#ef4444" /> Destination</div>
              <input
                className="cr-input" type="text" readOnly
                value={dropoff.locationName}
                placeholder="Click on map to set…"
              />
            </div>

            <div className="cr-row">
              <div className="cr-field">
                <div className="cr-label"><FaCalendarAlt size={10} /> Date</div>
                <input className="cr-input" type="date" value={rideDetails.date}
                  onChange={e => setRideDetails(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="cr-field">
                <div className="cr-label"><FaClock size={10} /> Time</div>
                <input className="cr-input" type="time" value={rideDetails.time}
                  onChange={e => setRideDetails(p => ({ ...p, time: e.target.value }))} />
              </div>
            </div>

            <div className="cr-field">
              <div className="cr-label"><FaChair size={10} /> Seats Available</div>
              <input className="cr-input" type="number" min={1} max={maxSeatsPerTrip}
                value={rideDetails.seatsAvailable}
                onChange={e => setRideDetails(p => ({
                  ...p, seatsAvailable: Math.min(parseInt(e.target.value) || 1, maxSeatsPerTrip)
                }))} />
              <div className="cr-seats-info"><span>Min: 1</span><span>Max: {maxSeatsPerTrip}</span></div>
            </div>

            <button className="cr-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Publishing…' : 'Publish Trip →'}
            </button>
          </div>

          {/* MAP */}
          <div className="cr-map-col">
            <div ref={mapContainerRef} className="cr-map-inner" />
            <div className={`cr-map-badge ${clickMode === 'pickup' ? 'pickup' : 'dest'}`}>
              {clickMode === 'pickup' ? '📍 Click to set new pickup' : 'Click to set destination'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateRide;