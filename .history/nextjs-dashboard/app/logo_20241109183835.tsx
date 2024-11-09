// components/Logo.tsx
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div style={styles.logo}>
      <img src="../p" alt="MyLogo" style={styles.logoImage} />
    </div>
  );
};

// Basic inline styles for the logo
const styles = {
  logo: {
    display: 'flex',
    alignItems: 'center',
  },
  logoImage: {
    height: '50px', // Adjust the height as needed
  },
};

export default Logo;
