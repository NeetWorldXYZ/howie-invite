import React from 'react';

// Full-screen overlay. Tap the scrim or the close button to dismiss.
export function Overlay({ open, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className={'overlay-panel' + (wide ? ' wide' : '')} onClick={(e) => e.stopPropagation()}>
        <button className="overlay-close" onClick={onClose} aria-label="Close">✕</button>
        {children}
      </div>
    </div>
  );
}
