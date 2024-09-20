// AnswersContainer.js
import React, { useState } from 'react';
import AnswerOption from '../AnswerOption/AnswerOption'; 
import styles from './AnswersContainer.module.css';
import CustomButton from '../CustomButton/LargeButton'; 

const AnswersContainer = ({ answers, onSubmit }) => { // Accept onSubmit prop from parent
    const [selected, setSelected] = useState(null);

    const handleSelect = (index) => {
        setSelected(index);
    };

    const handleSubmit = () => {
        if (selected !== null) {
            onSubmit(answers[selected]); // Pass the selected answer to the parent's submit handler
        } else {
            alert('Please select an answer.');
        }
    };

    return (
        <div className={styles.container}>
            {answers.map((answer, index) => (
                <AnswerOption
                    key={index}
                    text={answer}
                    isSelected={selected === index}
                    onSelect={() => handleSelect(index)}
                />
            ))}
            <CustomButton 
                className={styles.customSubmit} 
                text="Submit Answer" 
                onClick={handleSubmit} 
            />
        </div>
    );
};

export default AnswersContainer;
