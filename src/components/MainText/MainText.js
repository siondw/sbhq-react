import React from 'react';
import { Link } from 'react-router-dom';
import styles from './MainText.module.css';

function MainText({ header, subheader, linkPath, linkText, gradient, headerStyle }) {
  const textStyle = gradient ? { background: gradient, color: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text' } : {};
  
  return (
    <div className={styles.mainText}>
      <div className={styles.header} style={{ ...textStyle, ...headerStyle }}>{header}</div>
      <div className={styles.subheader} style={textStyle}>
        {subheader}
        {linkPath && linkText && (
          <Link to={linkPath} className={styles.link}>{linkText}</Link>
        )}
      </div>
    </div>
  );
}

export default MainText;
