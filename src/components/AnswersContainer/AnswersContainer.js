import React, { useState } from 'react';
import AnswerOption from '../AnswerOption/AnswerOption'; // Ensure the path is correct
import styles from './AnswersContainer.module.css';

const AnswersContainer = ({ answers }) => {
    const [selected, setSelected] = useState(null);

    const handleSelect = (index) => {
        setSelected(index); // Toggle selected state based on index
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
        </div>
    );
};

export default AnswersContainer;
