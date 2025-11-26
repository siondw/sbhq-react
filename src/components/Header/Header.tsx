import React from "react";
import styles from "./Header.module.css";
import { useAuth } from '../../contexts/AuthContext';

import MySvgComponent from "../SVG";

function Header() {
  const { user } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.icons}>
        <MySvgComponent iconType="trophy" height="16px" width="16px" />
        <div style={{ fontSize: '14px' }}>Superbowl HQ</div>
      </div>
      <div className={styles.userName}>
        {user ? user.user_metadata?.full_name || user.email || 'User' : 'Guest'}
      </div>
    </header>
  );
}

export default Header;
