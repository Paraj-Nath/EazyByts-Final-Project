// src/components/Message.js
import React from 'react';

function Message({ variant = 'info', children }) {
  const styles = {
    padding: '10px 15px',
    borderRadius: '5px',
    marginBottom: '15px',
    textAlign: 'center',
    fontWeight: 'bold',
  };

  const getVariantStyles = (variant) => {
    switch (variant) {
      case 'danger':
        return {
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
        };
      case 'success':
        return {
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
        };
      case 'info':
      default:
        return {
          backgroundColor: '#d1ecf1',
          color: '#0c5460',
          border: '1px solid #bee5eb',
        };
    }
  };

  return (
    <div style={{ ...styles, ...getVariantStyles(variant) }}>
      {children}
    </div>
  );
}

export default Message;