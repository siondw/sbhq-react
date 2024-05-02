import React from 'react';
import styles from './LargeButton.module.css';

const CustomButton = ({ text, onClick, className }) => {
  return (
    <button className={`${styles.custom} ${className || ''}`} onClick={onClick}>
      {text}
    </button>
  );
};

export default CustomButton;
