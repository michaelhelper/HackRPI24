// components/Logo.tsx
import React from 'react';
import Logo from './logo'; // Import the Logo component

const Logo: React.FC = () => {
  return (
    <div style={styles.logo}>
      {/* You can replace this text with an <img> tag if you have a logo image */}
      <h1 style={styles.logoText}>MyLogo</h1>
    </div>
  );
};

// Basic inline styles for the logo
const styles = {
  logo: {
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    fontSize: '1.5rem',
    color: 'white',
    margin: 0,
  },
};

export default Logo;
