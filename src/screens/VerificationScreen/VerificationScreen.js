import React from "react";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import PinInput from "../../components/PinInput/PinInput";
import styles from "./VerificationScreen.module.css";

function VerificationScreen({ onSubmitVerificationCode }) {
    return (
        <div className={styles.verificationScreen}>
            <div className={styles.header}>  
                <Header />
            </div>
            <div className={styles.content}>
                <MainText
                    header="Enter PIN"
                    subheader="Please enter the 6-digit code we sent to your phone."
                />
                <PinInput onPinComplete={onSubmitVerificationCode} />
            </div>
        </div>
    );
}

export default VerificationScreen;
