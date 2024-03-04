import React from 'react';
import { Link } from 'react-router-dom';
import styles from './MainText.module.css'; // Adjust the path to your CSS file

function MainText({ header, subheader, linkPath, linkText }) {
  return (
    <div className={styles.mainText}>
      <div className={styles.header}>{header}</div>
      <div className={styles.subheader}>
        {subheader}
        {linkPath && linkText && (
          <Link to={linkPath} className={styles.link}>{linkText}</Link>
        )}
      </div>
    </div>
  );
}

export default MainText;
