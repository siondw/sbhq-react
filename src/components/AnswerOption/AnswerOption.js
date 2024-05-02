import React, { useState } from 'react';
import styles from './AnswerOption.module.css';
import SelectionIndicator from '../SelectionIndicator/SelectionIndicator';

const AnswerOption = ({ text, isSelected, onSelect }) => {
    return (
        <div className={styles.answerOption} onClick={onSelect}>
            <span className={styles.answerText}>{text}</span>
            <SelectionIndicator isSelected={isSelected} />
        </div>
    );
};

export default AnswerOption;
