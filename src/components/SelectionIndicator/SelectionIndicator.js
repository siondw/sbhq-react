import React from 'react';
import styles from './SelectionIndicator.module.css';

const SelectionIndicator = ({ isSelected }) => {
    return (
        <div className={styles.outerRing}>
            {isSelected && <div className={styles.innerDot}></div>}
        </div>
    );
};

export default SelectionIndicator;
