import React from 'react';
import { format } from 'date-fns';
import styles from './ContestCard.module.css';

function ContestCard({ contest, onJoin, isRegistered }) {
  let formattedTime;
  try {
    formattedTime = format(new Date(contest.startTime), 'MM/dd @ h:mm a');
  } catch (error) {
    console.error('Invalid date format for contest startTime:', contest.startTime, error);
    formattedTime = 'Invalid date';
  }

  return (
    <div className={styles.contestCard}>
      <span className={styles.price}>${contest.price}</span>
      <div className={styles.contentGroup}>
        <h2 className={styles.title}>{contest.name}</h2>
        <p className={styles.time}>{formattedTime}</p>
        {isRegistered ? (
          <button className={`${styles.joinButton} ${styles.registeredButton}`} disabled>
            Registered
          </button>
        ) : (
          <button className={styles.joinButton} onClick={() => onJoin(contest.id)}>
            Join Contest
          </button>
        )}
      </div>
    </div>
  );
}

export default ContestCard;
