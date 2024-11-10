// components/Navbar.tsx
1import React from 'react';Q23
import Logo from './logo'; // Import the Logo component

const Navbar: React.FC = () => {
  return (
    <nav style={styles.navbar}>
      <div style={styles.logoContainer}>
        <Logo />
      </div>
      <ul style={styles.navLinks}>

        <li style={styles.navItem}><a href="#home" style={styles.navLink}>Home</a></li>
        <li style={styles.navItem}><a href="#about" style={styles.navLink}>About</a></li>
      </ul>
    </nav>
  );
};

// Basic inline styles for the navbar
const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: 'grey',
    color: '#fff',
  },
  logoContainer: {
    flexGrow: 1,
  },
  navLinks: {
    display: 'flex',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  navItem: {
    marginLeft: '1.5rem',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'color 0.3s',
    '&:hover': {
      color: '#f0a500',
    },
  },
};

export default Navbar;
