// Button.js
import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, color = 'primary', ...props }) => (
  <button
    className={`${styles.button} ${styles[color]}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
