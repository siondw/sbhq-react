import React from 'react';
import styles from './LargeButton.module.css';

interface CustomButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
}

const CustomButton = ({ text, onClick, className, id, type = 'button' }: CustomButtonProps) => {
  return (
    <button id={id} type={type} className={`${styles.custom} ${className || ''}`} onClick={onClick}>
      {text}
    </button>
  );
};

export default CustomButton;
