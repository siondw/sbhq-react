import React from 'react';
import styles from './PlayersList.module.css';

function PlayersList({ players }) {
  const MAX_VISIBLE_PLAYERS = 20;
  const visiblePlayers = players.slice(0, MAX_VISIBLE_PLAYERS);
  const remainingCount = Math.max(0, players.length - MAX_VISIBLE_PLAYERS);

  return (
    <div className={styles.playerListContainer}>
      <h2 className={styles.header}>{players.length} Players in lobby</h2>
      <div className={styles.playerGrid}>
        {visiblePlayers.map((player, index) => (
          <span key={index} className={styles.player}>
            {player}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className={styles.player}>+{remainingCount} more</span>
        )}
      </div>
    </div>
  );
}

export default PlayersList;
