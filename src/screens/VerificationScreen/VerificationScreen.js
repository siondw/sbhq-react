import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import PinInput from "../../components/PinInput/PinInput";
import styles from "./VerificationScreen.module.css";
import { useAuth } from "../../contexts/AuthContext";

import { getAuth } from "firebase/auth";

import * as UserService from "../../services/UserServices";
import { useUser, UserProvider } from "../../contexts/UserContext";

function VerificationScreen() {
  const navigate = useNavigate();
  const { confirmationResult } = useAuth();
  const [error, setError] = useState("");

  const onSubmitVerificationCode = async (pin) => {
    if (confirmationResult) {
      try {
        const result = await confirmationResult.confirm(pin);
        console.log("User verified with UID:", result.user.uid);

        // Check if user exists in the database
        const userExists = await UserService.checkUserExists(result.user.uid);
        if (!userExists) {
          // If user does not exist, add them to the database
          await UserService.addUserToDB(
            result.user.uid,
            result.user.displayName,
            result.user.phoneNumber
          );
          console.log("New user added to database.");
        } else {
          console.log("User already exists, retrieving details.");
          // Optionally fetch user details
          const userDetails = await UserService.getUserDetails(result.user.uid);
          console.log("Retrieved user details:", userDetails);
        }

        navigate("/pregame");
      } catch (error) {
        console.error(
          "Failed during user verification or database operations:",
          error
        );
        setError(
          "Failed to verify code or handle user data. Please try again."
        );
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
