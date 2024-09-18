// ContestCreation.js
import React from 'react';
import Input from '../Input/Input';
import Button from '../Button/button';
import styles from './ContestCreation.module.css';

const ContestCreation = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Create New Contest</h2>
      <form className={styles.form}>
        <Input type="text" placeholder="Contest Title" />
        <Input type="datetime-local" placeholder="Start Time" />
        <textarea 
          placeholder="Contest Description" 
          rows={4} 
          className={styles.textarea}
        />
        <Input type="number" placeholder="Maximum Participants" />
        <Button type="submit">Create Contest</Button>
      </form>
    </div>
  );
};

export default ContestCreation;
