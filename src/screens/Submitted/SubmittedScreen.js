import React from 'react';
import Header from '../../components/Header/Header';  // Adjust the path as necessary
import MainText from '../../components/MainText/MainText';
import styles from './SubmittedScreen.module.css';  

import ballGif from '../../assets/ball.gif';  

function SubmittedScreen() {
    return (
        <div className={styles.submittedScreen}>
            <div className={styles.headerContainer}>
                <Header />
            </div>
            <div className={styles.mainTextContainer}>
                <MainText 
                    header="Submitted!" 
                    subheader="Awaiting Results..."
                />
            </div>
            <div className={styles.gifContainer}>
                <img src={ballGif} alt="Awaiting results" className={styles.ballGif} style={{ width: 250, height: 250 }} /> 
            </div>
        </div>
    );
}

export default SubmittedScreen;
