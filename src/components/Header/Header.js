import React from "react";
import styles from "./Header.module.css"; // Assuming you moved the CSS to a separate file

import MySvgComponent from "../SVG.js"


function Header({ username }) {
  return (
    <header className={styles.header}>
      <div className={styles.icons}>
        <MySvgComponent height="16px" width="16px" />
        <div style={{ fontSize: "14px" }}>Superbowl HQ</div>
      </div>
      {/* Check if the username exists before adding it */}
      <div className={styles.userName}>{username}</div>
    </header>
  );
}

export default Header;
