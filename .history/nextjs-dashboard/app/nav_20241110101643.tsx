// src/components/Navbar.tsx

import React from 'react';
import Link from 'next/link';
import Logo from './logo'; // Ensure the path is correct
import styles from './navbar.module.css'; // Import the CSS module

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Logo />
      </div>
      <ul className={styles.navLinks}>
        <li className={styles.navItem}>
          <Link href="/nextjs-dashboard/" className={styles.navLink}>
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