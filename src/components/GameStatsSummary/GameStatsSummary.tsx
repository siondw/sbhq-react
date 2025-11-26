import React from 'react';
import styles from './GameStatsSummary.module.css';
import DollarSignIcon from '../../assets/DollarSignIcon.svg';
import LeaderboardIcon from '../../assets/leaderboard.svg';
import PersonIcon from '../../assets/person.svg';

interface GameStatsSummaryProps {
  numberOfRemainingPlayers: number;
  roundNumber: number;
  className?: string;
}

function GameStatsSummary({ numberOfRemainingPlayers, roundNumber, className }: GameStatsSummaryProps) {
  const chanceOfWinning =
    numberOfRemainingPlayers > 0 ? ((1 / numberOfRemainingPlayers) * 100).toFixed(2) : '0.00';

  return (
    <div className={`${styles.statsSummary} ${className || ''}`}>
      <div className={styles.statItem}>
        <img src={PersonIcon} alt="Person Icon" className={styles.icon} />
        <span className={styles.text}>{numberOfRemainingPlayers} players remaining</span>
      </div>
      <div className={styles.statItem}>
        <img src={LeaderboardIcon} alt="Leaderboard Icon" className={styles.icon} />
        <span className={styles.text}>Round {roundNumber}</span>
      </div>
      <div className={styles.statItem}>
        <img src={DollarSignIcon} alt="Dollar Sign Icon" className={styles.icon} />
        <span className={styles.text}>{chanceOfWinning}% Chance of Winning</span>
      </div>
    </div>
  );
}

export default GameStatsSummary;
