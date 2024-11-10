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
  logoImage: {
    width: 'px',
    height: '100px',
    borderRadius: '50%',
  },
};

export default Logo;
