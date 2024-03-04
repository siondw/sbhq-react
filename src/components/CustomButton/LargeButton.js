import React from 'react'
import styles from './LargeButton.module.css'; // Create a CSS file for styling

const CustomButton = ({ text, onClick }) => {
  return (
    <button className={styles.custom} onClick={onClick} >
      {text}
    </button>
  );
};

export default CustomButton;
