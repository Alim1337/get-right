import React, { useEffect } from 'react';
import { FaMapMarkerAlt, FaClock, FaUser, FaPhone, FaTimes, FaRoute } from 'react-icons/fa';

const ReservedRidesModal = ({ reservations, onClose, showInMap, location }) => {

  const handleDeleteReservation = async (reservationId) => {
    try {
      await fetch('/api/apiReservation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId }),
      });
    } catch (error) { console.error('Error deleting reservation:', error); }
  };

  const formatTime = (seconds) => {
    if (seconds < 0) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <>
      <style>{`
        .rrm-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 100;
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
          backdrop-filter: blur(4px);
        }
        .rrm-modal {
          background: #fff; border-radius: 16px;
          width: 100%; max-width: 560px;
          max-height: 80vh; display: flex; flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          overflow: hidden;
        }
        .rrm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f3f4f6;
        }
        .rrm-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem; font-weight: 700; color: #111827;
        }
        .rrm-close {
          width: 32px; height: 32px; border-radius: 8px;
          background: #f3f4f6; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #6b7280; transition: all 0.15s;
        }
        .rrm-close:hover { background: #e5e7eb; color: #111827; }

        .rrm-body { overflow-y: auto; padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }

        .rrm-card {
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 12px; padding: 1rem;
        }

        .rrm-card-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .rrm-driver {
          display: flex; align-items: center; gap: 0.5rem;
        }
        .rrm-driver-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 700; color: #fff;
        }
        .rrm-driver-name { font-size: 0.85rem; font-weight: 600; color: #111827; }
        .rrm-driver-phone { font-size: 0.72rem; color: #9ca3af; }

        .rrm-timer {
          font-size: 0.72rem; font-weight: 600;
          padding: 0.25rem 0.6rem; border-radius: 100px;
        }
        .rrm-timer.active { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .rrm-timer.passed { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }

        .rrm-route {
          display: flex; flex-direction: column; gap: 0.4rem;
          background: #fff; border-radius: 8px;
          padding: 0.65rem 0.85rem; margin-bottom: 0.75rem;
          border: 1px solid #f3f4f6;
        }
        .rrm-route-row {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.8rem; color: #374151;
        }
        .rrm-divider { width: 1px; height: 10px; background: #e5e7eb; margin-left: 6px; }

        .rrm-meta {
          display: flex; gap: 1rem; margin-bottom: 0.75rem;
        }
        .rrm-meta-item {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.75rem; color: #6b7280;
        }

        .rrm-actions { display: flex; gap: 0.5rem; }
        .rrm-btn-map {
          flex: 1; padding: 0.55rem;
          background: #eef2ff; color: #4f46e5;
          border: 1px solid #c7d2fe; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
        }
        .rrm-btn-map:hover { background: #e0e7ff; }

        .rrm-empty {
          text-align: center; padding: 3rem 1rem;
          color: #9ca3af; font-size: 0.9rem;
        }
      `}</style>

      <div className="rrm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="rrm-modal">
          <div className="rrm-header">
            <div className="rrm-title">Your Reserved Rides</div>
            <button className="rrm-close" onClick={onClose}><FaTimes size={14} /></button>
          </div>

          <div className="rrm-body">
            {!reservations || reservations.length === 0 ? (
              <div className="rrm-empty">No reserved rides yet.</div>
            ) : reservations.map((r) => {
              const now = new Date();
              const dep = new Date(r.departureTime);
              const diff = Math.floor((dep - now) / 1000);
              if (diff <= -12 * 60 * 60) handleDeleteReservation(r.reservationId);
              const initials = `${r.driver?.firstName?.[0] || ''}${r.driver?.lastName?.[0] || ''}`;
              return (
                <div key={r.reservationId} className="rrm-card">
                  <div className="rrm-card-header">
                    <div className="rrm-driver">
                      <div className="rrm-driver-avatar">{initials}</div>
                      <div>
                        <div className="rrm-driver-name">{r.driver?.firstName} {r.driver?.lastName}</div>
                        <div className="rrm-driver-phone">{r.driver?.phoneNumber}</div>
                      </div>
                    </div>
                    <div className={`rrm-timer ${diff >= 0 ? 'active' : 'passed'}`}>
                      {diff >= 0 ? formatTime(diff) + ' left' : 'Departed'}
                    </div>
                  </div>

                  <div className="rrm-route">
                    <div className="rrm-route-row">
                      <FaMapMarkerAlt size={11} color="#16a34a" />
                      {r.departureLocation}
                    </div>
                    <div className="rrm-divider" />
                    <div className="rrm-route-row">
                      <FaMapMarkerAlt size={11} color="#ef4444" />
                      {r.destinationLocation}
                    </div>
                  </div>

                  <div className="rrm-meta">
                    <div className="rrm-meta-item">
                      <FaClock size={11} />
                      {new Date(r.reservationTime).toLocaleString()}
                    </div>
                    <div className="rrm-meta-item">
                      <FaClock size={11} color="#4f46e5" />
                      Departs: {new Date(r.departureTime).toLocaleString()}
                    </div>
                  </div>

                  <div className="rrm-actions">
                    <button className="rrm-btn-map" onClick={() => showInMap(r)}>
                      <FaRoute size={12} /> Show on Map
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

export default ReservedRidesModal;
