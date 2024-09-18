// SubmissionManagement.js
import React from 'react';
import Button from '../Button/button';
import styles from './SubmissionManagement.module.css';

const SubmissionManagement = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Manage Submissions</h2>
      <div className={styles.statsContainer}>
        <div className={styles.statsText}>Time Remaining: 1:30</div>
        <Button color="danger">Close Submissions</Button>
      </div>
      <div className={styles.submissionStats}>
        <h3 className={styles.subHeading}>Submission Stats</h3>
        <p className={styles.textSecondary}>Total Participants: 750</p>
        <p className={styles.textSecondary}>Submissions Received: 680</p>
        <p className={styles.textSecondary}>Pending Submissions: 70</p>
      </div>
    </div>
  );
};

export default SubmissionManagement;
