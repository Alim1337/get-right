import React, { useState } from 'react';
import { FaExclamationTriangle, FaTimes, FaCheckCircle } from 'react-icons/fa';

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

  return (
    <>
      <style>{`
        .rpm-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
          backdrop-filter: blur(4px);
        }
        .rpm-modal {
          background: #fff; border-radius: 16px;
          width: 100%; max-width: 440px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          overflow: hidden;
        }
        .rpm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 1.5rem;
          background: #fef2f2; border-bottom: 1px solid #fecaca;
        }
        .rpm-header-left { display: flex; align-items: center; gap: 0.6rem; }
        .rpm-header-icon {
          width: 34px; height: 34px; border-radius: 8px;
          background: #fee2e2; display: flex;
          align-items: center; justify-content: center;
          color: #ef4444;
        }
        .rpm-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #111827; }
        .rpm-close {
          width: 30px; height: 30px; border-radius: 7px;
          background: rgba(0,0,0,0.05); border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #6b7280; transition: all 0.15s;
        }
        .rpm-close:hover { background: rgba(0,0,0,0.1); color: #111827; }

        .rpm-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

        .rpm-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .rpm-label {
          font-size: 0.72rem; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.07em;
        }
        .rpm-select, .rpm-textarea {
          width: 100%; padding: 0.7rem 0.9rem;
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 8px; font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif; color: #111827;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .rpm-select:focus, .rpm-textarea:focus {
          border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); background: #fff;
        }
        .rpm-textarea { resize: vertical; min-height: 100px; }

        .rpm-status {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.6rem 0.85rem; border-radius: 8px;
          font-size: 0.8rem; font-weight: 500;
        }
        .rpm-status.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .rpm-status.error { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }

        .rpm-footer {
          display: flex; gap: 0.65rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #f3f4f6;
        }
        .rpm-btn-cancel {
          flex: 1; padding: 0.7rem;
          background: transparent; color: #6b7280;
          border: 1px solid #e5e7eb; border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
          cursor: pointer; transition: all 0.15s;
        }
        .rpm-btn-cancel:hover { border-color: #d1d5db; color: #374151; }
        .rpm-btn-submit {
          flex: 2; padding: 0.7rem;
          background: #ef4444; color: #fff;
          border: none; border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
        }
        .rpm-btn-submit:hover { background: #dc2626; }
        .rpm-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="rpm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="rpm-modal">
          <div className="rpm-header">
            <div className="rpm-header-left">
              <div className="rpm-header-icon"><FaExclamationTriangle size={15} /></div>
              <div className="rpm-title">Report an Issue</div>
            </div>
            <button className="rpm-close" onClick={onClose}><FaTimes size={13} /></button>
          </div>

          <div className="rpm-body">
            <div className="rpm-field">
              <div className="rpm-label">Problem Type</div>
              <select className="rpm-select" value={problemType} onChange={e => setProblemType(e.target.value)}>
                <option value="technical">Technical Problem</option>
                <option value="user">Report a User</option>
              </select>
            </div>

            <div className="rpm-field">
              <div className="rpm-label">Problem Details</div>
              <textarea
                className="rpm-textarea"
                value={problemDetails}
                onChange={e => setProblemDetails(e.target.value)}
                placeholder="Describe the issue in detail…"
              />
            </div>

            {status === 'success' && (
              <div className="rpm-status success">
                <FaCheckCircle size={14} /> Report submitted successfully!
              </div>
            )}
            {status === 'error' && (
              <div className="rpm-status error">
                <FaExclamationTriangle size={14} /> Failed to submit. Please try again.
              </div>
            )}
          </div>

          <div className="rpm-footer">
            <button className="rpm-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="rpm-btn-submit" onClick={handleSubmit} disabled={status === 'loading' || !problemDetails.trim()}>
              {status === 'loading' ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportModal;
