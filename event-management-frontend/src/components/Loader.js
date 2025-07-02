// src/components/Loader.js
import React from 'react';

function Loader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100px',
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      position: 'absolute', // or fixed, depending on context
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 999
    }}>
      <div
        style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
        }}
      ></div>
      <p style={{ marginLeft: '10px', color: '#555' }}>Loading...</p>

      {/* Add keyframes for animation if not in global CSS */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Loader;