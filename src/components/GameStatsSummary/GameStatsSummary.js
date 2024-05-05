import React from 'react';
import styles from './GameStatsSummary.module.css'; // Ensure the path is correct

import DollarSignIcon from '../../assets/DollarSignIcon.svg';
import LeaderboardIcon from '../../assets/leaderboard.svg';
import PersonIcon from '../../assets/person.svg';

function GameStatsSummary({ numberOfRemainingPlayers, roundNumber }) {
  const chanceOfWinning = (1 / numberOfRemainingPlayers * 100).toFixed(2); // Calculate chance of winning

  return (
    <div className={styles.statsSummary}>
      <div className={styles.statItem}>
        <img src={PersonIcon} alt="Person Icon" className={styles.icon} />
        <span>{numberOfRemainingPlayers} players remaining</span>
      </div>
      <div className={styles.statItem}>
        <img src={LeaderboardIcon} alt="Leaderboard Icon" className={styles.icon} />
        <span>Round {roundNumber}</span>
      </div>
      <div className={styles.statItem}>
        <img src={DollarSignIcon} alt="Dollar Sign Icon" className={styles.icon} />
        <span>{chanceOfWinning}% chance of winning</span>
      </div>
    </div>
  );
}

export default GameStatsSummary;
