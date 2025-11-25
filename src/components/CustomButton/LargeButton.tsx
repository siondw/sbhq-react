import React from 'react';
import styles from './LargeButton.module.css';

interface CustomButtonProps {
  text: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  onClick,
  className,
  id,
  type = 'button',
}) => {
  return (
    <button
      id={id}
      type={type}
      className={`${styles.custom} ${className || ''}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default CustomButton;
