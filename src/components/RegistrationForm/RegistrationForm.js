import React, { useState, useEffect } from "react";
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";

import firebase from "../../firebase";
import styles from "./Registrationform.module.css";

function RegistrationForm() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState({});

  const auth = getAuth();

  useEffect(() => {
    const auth = getAuth(firebase);
    let verifier;
    if (!window.recaptchaVerifier) {
      verifier = new RecaptchaVerifier(auth, "submit-button", {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, logic here
        },
      });
      window.recaptchaVerifier = verifier;
    }
    return () => {
      if (verifier) {
        verifier.clear(); // Clean up the reCAPTCHA instance
      }
    };
  }, []);

  const validateForm = () => {
    let newErrors = {};

    // Check if full name is empty
    if (!fullName.trim()) newErrors.fullName = "Full name is required.";

    // Check if username is empty
    if (!username.trim()) newErrors.username = "Username is required.";

    // Check if phone number is valid
    // Regex for phone number validation
    const phoneRegex = /^(\d{3}-\d{3}-\d{4}|\d{10})$/;
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ""))) {
      newErrors.phoneNumber = "Invalid phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const isValid = validateForm();
    if (!isValid) return; // Stop submission if validation fails

    // Proceed with Firebase phone number authentication
    // and additional user data storage
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.inputField}
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full Name"
      />
      {errors.fullName && <div className="error">{errors.fullName}</div>}

      <input
        className={styles.inputField}
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      {errors.username && <div className="error">{errors.username}</div>}

      <input
        className={styles.inputField}
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Phone Number"
      />
      {errors.phoneNumber && <div className="error">{errors.phoneNumber}</div>}

      <button id="submit-button" type="submit">
        Register
      </button>
    </form>
  );
}

export default RegistrationForm;
