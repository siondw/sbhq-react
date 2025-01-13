// src/screens/Admin/AdminScreen.js
import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./AdminScreen.module.css";

function AdminScreen() {
  return (
    <div className={styles.adminContainer}>
      {/* 
        If you want a Sidebar or header, put it here.
        e.g. <Sidebar /> 
      */}
      <div className={styles.contentArea}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminScreen;
