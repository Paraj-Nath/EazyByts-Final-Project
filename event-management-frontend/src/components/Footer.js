// src/components/Footer.js
import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer style={{
      backgroundColor: '#333',
      color: 'white',
      textAlign: 'center',
      padding: '20px 0',
      marginTop: 'auto', // Push footer to bottom
      width: '100%',
    }}>
      <p>&copy; {currentYear} Event Management App. All rights reserved.</p>
    </footer>
  );
}

export default Footer;