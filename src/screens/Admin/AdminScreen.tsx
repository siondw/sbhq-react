import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./AdminScreen.module.css";

function AdminScreen() {
  return (
    <div className={styles.adminContainer}>
      <div className={styles.contentArea}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminScreen;
