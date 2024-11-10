// src/components/Navbar.tsx

import React from 'react';
import Link from 'next/link';
import Logo from './logo'; // Ensure the path is correct
import 

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Logo />
      </div>
      <ul className={styles.navLinks}>
        <li className={styles.navItem}>
          <Link href="/" className={styles.navLink}>
            HOME
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/aboutUs" className={styles.navLink}>
            ABOUT US
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

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
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
  title: {
    marginLeft: '0.5rem',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#fff',
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