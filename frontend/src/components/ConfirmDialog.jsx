import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--danger)' }}>
            <AlertTriangle size={20} />
            <h3 className="modal-title" style={{ fontSize: '1.1rem' }}>{title || 'Confirm Action'}</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {message || 'Are you sure you want to proceed? This action cannot be undone.'}
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
