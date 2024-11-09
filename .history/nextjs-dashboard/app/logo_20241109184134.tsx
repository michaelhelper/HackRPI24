// components/Logo.tsx
import React from 'react';
import logoImage from '../public/logo.png';

const Logo: React.FC = () => {
  return (
    <div style={styles.logo}>
      
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
