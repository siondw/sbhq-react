// src/components/admin/InContest/StatCard.js
import React from "react";
import styles from "./StatCard.module.css";

function StatCard({ value, label }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}

export default StatCard;
