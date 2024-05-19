import React from 'react';
import styles from './PlayersList.module.css';

function PlayersList({ players }) {
  return (
    <div className={styles.playerListContainer}>
      <h2 className={styles.header}>{players.length} Players in lobby</h2>
      <div className={styles.playerGrid}>
        {players.map((player, index) => (
          <span key={index} className={styles.player}>
            {player}
          </span>
        ))}
      </div>
    </div>
  );
}

export default PlayersList;
