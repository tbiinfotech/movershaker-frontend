import React from 'react';

function SyncButton({ spinning, onClick, label = "Sync" }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        marginRight: '10px',
        backgroundColor: '#f8f9fa',
        color: '#007bff',
        border: '1px solid #007bff',
        borderRadius: '24px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: '16px',
        transition: 'background 0.2s, color 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#e3f0ff"}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#f8f9fa"}
    >
      {/* Sync SVG Icon */}
      <svg
        className={spinning ? 'spin' : ''}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        style={{ verticalAlign: 'middle' }}
      >
        <path
          d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 0.83-0.16 1.63-0.46 2.36l1.46 1.46C19.63 14.16 20 13.13 20 12c0-4.42-3.58-8-8-8zm-6.46 4.36l-1.46-1.46C4.37 9.84 4 10.87 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-0.83 0.16-1.63 0.46-2.36z"
          fill="#007bff"
        />
      </svg>
      <span style={{ fontSize: '12px', fontWeight: 500 }}>{label}</span>
    </button>
  );
}

export default SyncButton;
