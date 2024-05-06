import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import PinInput from "../../components/PinInput/PinInput";
import styles from "./VerificationScreen.module.css";
import { useAuth } from "../../components/RegistrationForm/AuthContext";

function VerificationScreen() {
  const navigate = useNavigate(); // Create an instance of useNavigate
  const { confirmationResult } = useAuth();
  const [error, setError] = useState("");

  const onSubmitVerificationCode = async (pin) => {
    if (confirmationResult) {
      try {
        const result = await confirmationResult.confirm(pin);
        console.log("User verified with UID:", result.user.uid);
        navigate("/pregame"); // Navigate to /pregame on successful verification
      } catch (error) {
        console.error("Failed to verify code:", error);
        setError("Failed to verify code. Please try again."); // Update error state to display message
      }
    }
  };

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
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

export default VerificationScreen;
