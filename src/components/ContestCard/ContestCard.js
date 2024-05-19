import React from 'react';
import { format } from 'date-fns';
import styles from './ContestCard.module.css';

function ContestCard({ contest, onJoin, isRegistered }) {
  // Format the contest time
  const formattedTime = format(new Date(contest.time), 'MM/dd @ h:mm a');

  return (
    <div className={styles.contestCard}>
      <div className={styles.header}>
        <h2 className={styles.title}>{contest.name}</h2>
        <span className={styles.price}>${contest.price}</span>
      </div>
      <p className={styles.details}>{contest.details}</p>
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
  );
}

export default ContestCard;
