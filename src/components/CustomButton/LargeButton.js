import React from 'react'
import styles from './LargeButton.module.css'; // Create a CSS file for styling

const CustomButton = ({ text }) => {
  return (
    <button className={styles.custom} >
      {text}
    </button>
  );
};

export default CustomButton;
