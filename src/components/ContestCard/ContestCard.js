import React from 'react';
import { format, parseISO } from 'date-fns';
import styles from './ContestCard.module.css';

function ContestCard({ contest, onJoin, isRegistered }) {
  let formattedTime;
  try {
    const date = parseISO(contest.start_time);
    formattedTime = format(date, 'MM/dd @ h:mm a');
  } catch (error) {
    console.error('Error formatting date:', contest.start_time, error);
    formattedTime = 'Invalid date';
  }

  return (
    <div className={styles.contestCard}>
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
