import React, { useState, useEffect } from "react";
import LargeButton from "../CustomButton/LargeButton";
import styles from "./RegistrationForm.module.css";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { registerUser } from '../../services/RegisterUser';

import { auth } from "../../firebase";

function RegistrationForm() {
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+1 ");
  const [errors, setErrors] = useState({});
  const [verifier, setVerifier] = useState(null);
  

  useEffect(() => {
    console.log('auth in verifier creation:', auth); 
    

    const verifier = new RecaptchaVerifier(auth, 'sign-in-button', { 
          'size': 'invisible',
          'callback': handleSubmit 
    });
    setVerifier(verifier); // Store the verifier in state
}, []); 


  const formatPhoneNumber = (value) => {
    if (!value) return "+1 ";
    const cleaned = value.replace(/[^\d+]/g, "");
    if (cleaned === "+") return "+1 ";
    if (!cleaned.startsWith("+")) return `+1 ${cleaned}`;

    const number = cleaned.slice(2); // Remove country code +1
    if (number.length < 4) {
      return `+1 (${number}`;
    }
    if (number.length < 7) {
      return `+1 (${number.slice(0, 3)}) ${number.slice(3)}`;
    }
    // Limiting input to the maximum length of a US phone number
    const formattedNumber = `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6, 10)}`;
    return number.length >= 10 ? formattedNumber : `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  };

  const validateForm = () => {
    let newErrors = {};
    // Check if username is valid
    if (!username.trim()) {
      newErrors.username = "Username is required.";
    } else if (username.length < 4 || username.length > 20) {
      newErrors.username = "Username must be 4-20 characters long.";
    }
    // Check if phone number is valid
    if (phoneNumber.length < 1) { // "+1 (XXX) XXX-XXXX" 18 characters
      newErrors.phoneNumber = "Complete phone number is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    console.log('auth in handleSubmit:', auth);

    event.preventDefault();
    if (!validateForm()) return; 
    const formattedUsername = username.trim().toLowerCase();

    try {
      signInWithPhoneNumber(auth, phoneNumber, verifier)
        .then((confirmationResult) => {
          const verificationCode = prompt('Please enter the verification code you received');
          return confirmationResult.confirm(verificationCode);
        })
        .then((result) => {
          registerUser(formattedUsername, phoneNumber);
          console.log("User registered with UID:", result.user.uid);
        });
    } catch (error) {
      console.error("Failed to sign in:", error);
      setErrors(prevErrors => ({ ...prevErrors, phoneNumber: 'Failed to verify phone number.' }));
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.inputField}
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      {errors.username && <div className={styles.error}>{errors.username}</div>}

      <input
        className={styles.inputField}
        type="text"
        value={phoneNumber}
        onChange={(e) => {
          if (e.target.value.length <= 18) {
            setPhoneNumber(formatPhoneNumber(e.target.value));
          }
        }}
        placeholder="Phone Number"
      />
      {errors.phoneNumber && <div className={styles.error}>{errors.phoneNumber}</div>}

      <LargeButton id="sign-in-button" text="Register" type="submit" onClick={handleSubmit} />
    </form>
  );
}

export default RegistrationForm;
