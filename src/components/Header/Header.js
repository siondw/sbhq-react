import React from "react";
import styles from "./Header.module.css"; // Assuming you moved the CSS to a separate file
import { useAuth } from '../../contexts/AuthContext';

import MySvgComponent from "../SVG.js"


function Header() {
  const { user } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.icons}>
        <MySvgComponent height="16px" width="16px" />
        <div style={{ fontSize: '14px' }}>Superbowl HQ</div>
      </div>
      {/* Check if the user exists before adding it */}
      <div className={styles.userName}>
        {user ? user.displayName : 'Guest'}
      </div>
    </header>
  );
}

export default Header;