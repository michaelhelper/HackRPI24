// components/Logo.tsx
import React from 'react';
import Image from 'next/image';
import logoImage from '../public/noiseScapeLogoTransparent.png';

const Logo: React.FC = () => {
  return (
      <Image src={logoImage} alt="Logo" style={styles.logoImage} />
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
