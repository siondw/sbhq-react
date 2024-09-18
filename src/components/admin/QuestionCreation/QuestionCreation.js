// QuestionCreation.js
import React from 'react';
import Input from '../Input/Input';
import Button from '../Button/Buttonutton';
import styles from './QuestionCreation.module.css';

const QuestionCreation = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Create Next Question</h2>
      <form className={styles.form}>
        <textarea 
          placeholder="Enter your question here..."
          rows={4}
          className={styles.textarea}
        />
        <div className={styles.optionRow}>
          <Input type="text" placeholder="Option 1" className={styles.input} />
          <Button type="button" color="secondary">Add Option</Button>
        </div>
        <div className={styles.optionRow}>
          <Input type="text" placeholder="Option 2" className={styles.input} />
          <Button type="button" color="secondary">Add Option</Button>
        </div>
        <Button type="submit">Submit Question</Button>
      </form>
    </div>
  );
};

export default QuestionCreation;
