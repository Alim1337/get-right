import React, { useState } from 'react';
import { FaExclamationTriangle, FaTimes, FaCheckCircle, FaBug, FaUser } from 'react-icons/fa';

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
  const [problemType, setProblemType] = useState('technical');
  const [problemDetails, setProblemDetails] = useState('');
  const [status, setStatus] = useState(null); // 'loading' | 'success' | 'error'

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!problemDetails.trim()) return;
    setStatus('loading');
    try {
      const reportData = {
        userId: localStorage.getItem('userId'),
        problemType,
        problemDetails,
      };
      const res = await fetch('/api/apiReports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      if (!res.ok) throw new Error();
      onSubmit(reportData);
      setStatus('success');
      setTimeout(() => {
        setStatus(null);
        setProblemDetails('');
        onClose();
      }, 2000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const types = [
    { value: 'technical', label: 'Technical Problem', icon: <FaBug size={13} />, color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
    { value: 'user',      label: 'Report a User',     icon: <FaUser size={13} />, color: '#f87171', bg: 'rgba(248,113,113,0.13)' },
  ];

  return (
    <>
      <style>{`
        @keyframes rpm-in {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes rpm-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .rpm-overlay {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          animation: rpm-fade 0.18s ease;
        }

        .rpm-modal {
          background: #151827;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 18px;
          width: 100%; max-width: 420px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04),
            0 24px 64px rgba(0,0,0,0.55),
            0 8px 24px rgba(0,0,0,0.35);
          overflow: hidden;
          animation: rpm-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* ── HEADER ── */
        .rpm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.2rem 1.4rem 1.1rem;
          background: linear-gradient(135deg, rgba(248,113,113,0.1), rgba(239,68,68,0.06));
          border-bottom: 1px solid rgba(248,113,113,0.15);
          position: relative;
        }
        .rpm-header::after {
          content: '';
          position: absolute; inset-x: 0; bottom: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(248,113,113,0.4), transparent);
        }
        .rpm-header-left { display: flex; align-items: center; gap: 0.7rem; }
        .rpm-header-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(248,113,113,0.15);
          border: 1px solid rgba(248,113,113,0.25);
          display: flex; align-items: center; justify-content: center;
          color: #f87171;
          box-shadow: 0 0 12px rgba(248,113,113,0.15);
        }
        .rpm-title {
          font-family: 'Bricolage Grotesque', 'Geist', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          color: #f0f2fc; letter-spacing: -0.01em;
        }
        .rpm-subtitle {
          font-size: 0.68rem; color: rgba(248,113,113,0.7);
          margin-top: 1px; font-weight: 400;
        }
        .rpm-close {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.35);
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .rpm-close:hover {
          background: rgba(248,113,113,0.12);
          border-color: rgba(248,113,113,0.25);
          color: #f87171;
        }

        /* ── BODY ── */
        .rpm-body {
          padding: 1.25rem 1.4rem;
          display: flex; flex-direction: column; gap: 1.1rem;
        }

        /* TYPE TOGGLE */
        .rpm-type-row { display: flex; gap: 0.5rem; }
        .rpm-type-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.45rem;
          padding: 0.62rem 0.5rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          font-size: 0.78rem; font-weight: 500;
          color: rgba(255,255,255,0.35);
          cursor: pointer;
          transition: all 0.16s;
          font-family: 'Geist', 'Instrument Sans', sans-serif;
        }
        .rpm-type-btn:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.6);
          border-color: rgba(255,255,255,0.14);
        }
        .rpm-type-btn.active-technical {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.35);
          color: #a5b4fc;
          box-shadow: 0 0 0 1px rgba(99,102,241,0.15) inset;
        }
        .rpm-type-btn.active-user {
          background: rgba(248,113,113,0.13);
          border-color: rgba(248,113,113,0.3);
          color: #fca5a5;
          box-shadow: 0 0 0 1px rgba(248,113,113,0.12) inset;
        }

        /* FIELD */
        .rpm-field { display: flex; flex-direction: column; gap: 0.45rem; }
        .rpm-label {
          font-size: 0.65rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: rgba(255,255,255,0.3);
        }
        .rpm-textarea {
          width: 100%;
          padding: 0.85rem 1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          font-size: 0.845rem; line-height: 1.55;
          font-family: 'Geist', 'Instrument Sans', sans-serif;
          color: #f0f2fc;
          outline: none;
          resize: vertical; min-height: 110px;
          transition: border-color 0.16s, background 0.16s, box-shadow 0.16s;
          caret-color: #818cf8;
        }
        .rpm-textarea::placeholder { color: rgba(255,255,255,0.18); }
        .rpm-textarea:focus {
          border-color: rgba(99,102,241,0.45);
          background: rgba(99,102,241,0.05);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1), 0 1px 3px rgba(0,0,0,0.2);
        }
        .rpm-char {
          font-size: 0.62rem; color: rgba(255,255,255,0.2);
          text-align: right; margin-top: -0.3rem;
          font-variant-numeric: tabular-nums;
        }
        .rpm-char.warn { color: #fbbf24; }

        /* STATUS BANNERS */
        .rpm-status {
          display: flex; align-items: center; gap: 0.55rem;
          padding: 0.65rem 0.9rem; border-radius: 10px;
          font-size: 0.8rem; font-weight: 500;
          animation: rpm-fade 0.2s ease;
        }
        .rpm-status.success {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          color: #86efac;
        }
        .rpm-status.error {
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.25);
          color: #fca5a5;
        }

        /* ── FOOTER ── */
        .rpm-footer {
          display: flex; gap: 0.6rem;
          padding: 1rem 1.4rem;
          border-top: 1px solid rgba(255,255,255,0.07);
          background: rgba(0,0,0,0.15);
        }
        .rpm-btn-cancel {
          flex: 1; padding: 0.7rem;
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.4);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 9px;
          font-family: 'Geist', 'Instrument Sans', sans-serif;
          font-size: 0.845rem; font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .rpm-btn-cancel:hover {
          background: rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.65);
          border-color: rgba(255,255,255,0.15);
        }
        .rpm-btn-submit {
          flex: 2; padding: 0.7rem;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
          border: none; border-radius: 9px;
          font-family: 'Geist', 'Instrument Sans', sans-serif;
          font-size: 0.845rem; font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 2px 12px rgba(239,68,68,0.3);
          position: relative; overflow: hidden;
        }
        .rpm-btn-submit::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0; transition: opacity 0.15s;
        }
        .rpm-btn-submit:hover::after { opacity: 1; }
        .rpm-btn-submit:hover { box-shadow: 0 4px 18px rgba(239,68,68,0.45); transform: translateY(-1px); }
        .rpm-btn-submit:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(239,68,68,0.3); }
        .rpm-btn-submit:disabled {
          opacity: 0.4; cursor: not-allowed;
          transform: none; box-shadow: none;
        }

        /* loading spinner */
        @keyframes rpm-spin { to { transform: rotate(360deg); } }
        .rpm-spinner {
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: rpm-spin 0.6s linear infinite;
          display: inline-block; vertical-align: middle;
          margin-right: 6px;
        }
      `}</style>

      <div className="rpm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="rpm-modal">

          <div className="rpm-header">
            <div className="rpm-header-left">
              <div className="rpm-header-icon">
                <FaExclamationTriangle size={15} />
              </div>
              <div>
                <div className="rpm-title">Report an Issue</div>
                <div className="rpm-subtitle">We'll review it as soon as possible</div>
              </div>
            </div>
            <button className="rpm-close" onClick={onClose}>
              <FaTimes size={12} />
            </button>
          </div>

          <div className="rpm-body">

            {/* Type toggle */}
            <div className="rpm-field">
              <div className="rpm-label">Problem Type</div>
              <div className="rpm-type-row">
                {types.map((t) => (
                  <button
                    key={t.value}
                    className={`rpm-type-btn ${problemType === t.value ? `active-${t.value}` : ''}`}
                    onClick={() => setProblemType(t.value)}
                    style={problemType === t.value ? { '--active-color': t.color } : {}}
                  >
                    <span style={{ color: problemType === t.value ? t.color : 'inherit' }}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="rpm-field">
              <div className="rpm-label">Details</div>
              <textarea
                className="rpm-textarea"
                value={problemDetails}
                onChange={(e) => setProblemDetails(e.target.value)}
                placeholder="Describe the issue clearly — what happened, when, and any steps to reproduce it…"
                maxLength={500}
              />
              <div className={`rpm-char ${problemDetails.length > 430 ? 'warn' : ''}`}>
                {problemDetails.length} / 500
              </div>
            </div>

            {status === 'success' && (
              <div className="rpm-status success">
                <FaCheckCircle size={13} /> Report submitted — thank you!
              </div>
            )}
            {status === 'error' && (
              <div className="rpm-status error">
                <FaExclamationTriangle size={13} /> Submission failed. Please try again.
              </div>
            )}
          </div>

          <div className="rpm-footer">
            <button className="rpm-btn-cancel" onClick={onClose}>Cancel</button>
            <button
              className="rpm-btn-submit"
              onClick={handleSubmit}
              disabled={status === 'loading' || !problemDetails.trim()}
            >
              {status === 'loading'
                ? <><span className="rpm-spinner" />Submitting…</>
                : 'Submit Report'
              }
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default ReportModal;