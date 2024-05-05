import React from 'react';
import styles from './LargeButton.module.css';

const CustomButton = ({ text, onClick, className, id }) => {
  return (
    <button id={id} className={`${styles.custom} ${className || ''}`} onClick={onClick}>
      {text}
    </button>
  );
};

export default CustomButton;
