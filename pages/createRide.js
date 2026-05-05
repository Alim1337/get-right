import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import mapboxgl from 'mapbox-gl';
import { accessToken } from '../components/Map';
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaChair, FaRoute } from "react-icons/fa";
import { toast } from 'sonner';
import Head from "next/head";

const CreateRide = () => {
  const router = useRouter();
  const [driverId, setDriverId] = useState('');
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [maxSeatsPerTrip, setMaxSeatsPerTrip] = useState(0);
  const [rideDetails, setRideDetails] = useState({ date: '', time: '', seatsAvailable: 1 });
  const [pickup, setPickup] = useState({ coordinates: [0, 0], locationName: "" });
  const [dropoff, setDropoff] = useState({ coordinates: [0, 0], locationName: "" });
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(false);
  let myPosition = [0, 0];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const decoded = JSON.parse(atob(token.split('.')[1]));
    setDriverId(decoded.userId);
  }, []);

  useEffect(() => {
    fetch('/api/getMaxSeatsPerTrip')
      .then(r => r.json())
      .then(d => setMaxSeatsPerTrip(d.maxSeatsPerTrip))
      .catch(console.error);
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`);
      const data = await res.json();
      return data.features[0]?.place_name || "Unknown Location";
    } catch { return "Unknown Location"; }
  };

  const drawOrUpdateLine = (start, end, m) => {
    const coords = [start, end];
    if (m.getSource('route')) {
      m.getSource('route').setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } });
    } else {
      m.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } } });
      m.addLayer({ id: 'route', type: 'line', source: 'route', paint: { 'line-color': '#4f46e5', 'line-width': 3 } });
    }
  };

  useEffect(() => {
    mapboxgl.accessToken = accessToken;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const loc = { coordinates: [pos.coords.longitude, pos.coords.latitude], locationName: await reverseGeocode(pos.coords.latitude, pos.coords.longitude) };
      setPickup(loc);
      myPosition = loc.coordinates;
      const m = new mapboxgl.Map({ container: "cr-map", style: "mapbox://styles/mapbox/light-v11", center: loc.coordinates, zoom: 12 });
      new mapboxgl.Marker({ color: "#4f46e5" }).setLngLat(loc.coordinates).setPopup(new mapboxgl.Popup().setHTML(loc.locationName)).addTo(m);
      let prevMarker = null;
      m.on("dblclick", async (e) => {
        const lngLat = e.lngLat.toArray();
        const name = await reverseGeocode(lngLat[1], lngLat[0]);
        setDropoff({ coordinates: lngLat, locationName: name });
        if (prevMarker) prevMarker.remove();
        const marker = new mapboxgl.Marker({ color: "#ef4444" }).setLngLat(lngLat).addTo(m);
        new mapboxgl.Popup({ offset: 25 }).setHTML(name).addTo(m);
        marker.setPopup(new mapboxgl.Popup().setHTML(name));
        prevMarker = marker;
        setDestinationMarker(marker);
        drawOrUpdateLine(myPosition, lngLat, m);
      });
      setMap(m);
    }, (err) => {
      console.error(err);
      const m = new mapboxgl.Map({ container: "cr-map", style: "mapbox://styles/mapbox/light-v11", center: [0, 0], zoom: 2 });
      setMap(m);
    });
  }, []);

  const reverseGeocodeCoords = async (name) => {
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(name)}.json?access_token=${accessToken}`);
      const data = await res.json();
      const coords = data.features[0]?.geometry?.coordinates || [0, 0];
      return { latitude: coords[1], longitude: coords[0] };
    } catch { return { latitude: 0, longitude: 0 }; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dropoff.locationName) { toast.error('Please select a destination on the map'); return; }
    if (!rideDetails.date || !rideDetails.time) { toast.error('Please fill in date and time'); return; }
    setLoading(true);
    try {
      const pickupCoords = await reverseGeocodeCoords(pickup.locationName);
      const dropoffCoords = await reverseGeocodeCoords(dropoff.locationName);
      const res = await fetch('/api/apiCreateRide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departure: pickup.locationName, destination: dropoff.locationName,
          date: rideDetails.date, time: rideDetails.time,
          seatsAvailable: rideDetails.seatsAvailable, driverId,
          departureLatitude: pickupCoords.latitude, departureLongitude: pickupCoords.longitude,
          destinationLatitude: dropoffCoords.latitude, destinationLongitude: dropoffCoords.longitude,
        }),
      });
      if (res.ok) {
        localStorage.setItem('role', 'driver');
        toast.success('Trip created successfully!');
        router.push('/');
      } else { toast.error('Failed to create trip. Please try again.'); }
    } catch (e) { toast.error('An error occurred.'); }
    finally { setLoading(false); }
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

        .cr-root { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

        .cr-topbar {
          height: 60px; flex-shrink: 0;
          background: #1e2235;
          display: flex; align-items: center;
          padding: 0 1.25rem; gap: 1rem;
        }
        .cr-back {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 8px;
          background: rgba(255,255,255,0.08); border: none;
          color: #fff; cursor: pointer; transition: all 0.15s;
          text-decoration: none;
        }
        .cr-back:hover { background: rgba(255,255,255,0.15); }
        .cr-topbar-title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem; font-weight: 700; color: #fff;
        }

        .cr-body { flex: 1; display: flex; overflow: hidden; }

        .cr-form-col {
          width: 380px; flex-shrink: 0;
          background: #fff; border-right: 1px solid #e5e7eb;
          overflow-y: auto; padding: 1.5rem;
          display: flex; flex-direction: column; gap: 1.25rem;
        }

        .cr-form-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem; font-weight: 700;
          color: #111827; letter-spacing: -0.01em;
        }
        .cr-form-sub { font-size: 0.8rem; color: #9ca3af; margin-top: 0.2rem; }

        .cr-hint {
          display: flex; align-items: center; gap: 0.5rem;
          background: #eef2ff; border: 1px solid #c7d2fe;
          border-radius: 8px; padding: 0.65rem 0.85rem;
          font-size: 0.78rem; color: #4f46e5;
        }

        .cr-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .cr-label {
          font-size: 0.72rem; font-weight: 600;
          color: #6b7280; text-transform: uppercase; letter-spacing: 0.07em;
        }
        .cr-input {
          width: 100%; padding: 0.7rem 0.9rem;
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 8px; font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif; color: #111827;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .cr-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); background: #fff; }
        .cr-input:read-only { color: #6b7280; cursor: default; }

        .cr-row { display: flex; gap: 0.75rem; }
        .cr-row .cr-field { flex: 1; }

        .cr-seats-info {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 0.75rem; color: #9ca3af;
        }

        .cr-submit {
          width: 100%; padding: 0.85rem;
          background: #4f46e5; color: #fff;
          border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
          margin-top: auto;
        }
        .cr-submit:hover { background: #4338ca; }
        .cr-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .cr-map-col {
          flex: 1; position: relative; overflow: hidden;
        }
        #cr-map {
          width: 100%; height: 100%;
          position: absolute; top: 0; left: 0;
        }
        .cr-map-hint {
          position: absolute; bottom: 1rem; left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.95); border: 1px solid #e5e7eb;
          border-radius: 100px; padding: 0.4rem 1rem;
          font-size: 0.75rem; color: #6b7280;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          white-space: nowrap; z-index: 5;
        }
      `}</style>

      <div className="cr-root">
        <div className="cr-topbar">
          <Link href="/" passHref>
            <a className="cr-back"><BsArrowLeft size={16} /></a>
          </Link>
          <div className="cr-topbar-title">Create a Trip</div>
        </div>

        <div className="cr-body">
          <div className="cr-form-col">
            <div>
              <div className="cr-form-title">Trip Details</div>
              <div className="cr-form-sub">Double-click on the map to set your destination</div>
            </div>

            <div className="cr-hint">
              <FaRoute size={13} />
              Your current location is set as departure. Double-click map to set destination.
            </div>

            <div className="cr-field">
              <div className="cr-label"><FaMapMarkerAlt size={10} style={{display:'inline',marginRight:4}} />Pickup Location</div>
              <input className="cr-input" type="text" value={pickup.locationName} readOnly />
            </div>

            <div className="cr-field">
              <div className="cr-label"><FaMapMarkerAlt size={10} style={{display:'inline',marginRight:4,color:'#ef4444'}} />Destination</div>
              <input className="cr-input" type="text" value={dropoff.locationName} readOnly placeholder="Double-click on map…" />
            </div>

            <div className="cr-row">
              <div className="cr-field">
                <div className="cr-label"><FaCalendarAlt size={10} style={{display:'inline',marginRight:4}} />Date</div>
                <input className="cr-input" type="date" value={rideDetails.date}
                  onChange={e => setRideDetails(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="cr-field">
                <div className="cr-label"><FaClock size={10} style={{display:'inline',marginRight:4}} />Time</div>
                <input className="cr-input" type="time" value={rideDetails.time}
                  onChange={e => setRideDetails(p => ({ ...p, time: e.target.value }))} />
              </div>
            </div>

            <div className="cr-field">
              <div className="cr-label"><FaChair size={10} style={{display:'inline',marginRight:4}} />Seats Available</div>
              <input className="cr-input" type="number" min={1} max={maxSeatsPerTrip}
                value={rideDetails.seatsAvailable}
                onChange={e => setRideDetails(p => ({ ...p, seatsAvailable: Math.min(parseInt(e.target.value) || 1, maxSeatsPerTrip) }))} />
              <div className="cr-seats-info">
                <span>Min: 1</span>
                <span>Max allowed: {maxSeatsPerTrip}</span>
              </div>
            </div>

            <button className="cr-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Publishing…' : 'Publish Trip →'}
            </button>
          </div>

          <div className="cr-map-col">
            <div id="cr-map" />
            <div className="cr-map-hint">Double-click to set destination</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateRide;
