import React, { useState } from 'react';
import styles from './AnswerOption.module.css';
import SelectionIndicator from '../SelectionIndicator/SelectionIndicator';

const AnswerOption = ({ text, isSelected, onSelect }) => {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(true);
        onSelect();
    };

    const handleTransitionEnd = () => {
        setIsClicked(false);
    };

    return (
        <div 
            className={`${styles.answerOption} ${isClicked ? styles.answerOptionClicked : ''}`} 
            onClick={handleClick} 
            onTransitionEnd={handleTransitionEnd}
        >
            <span className={styles.answerText}>{text}</span>
            <SelectionIndicator isSelected={isSelected} />
        </div>
    );
};

export default AnswerOption;