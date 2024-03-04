import React, { useState } from "react";

import LargeButton from "../CustomButton/LargeButton";
import styles from "./RegistrationForm.module.css";

function RegistrationForm() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    // Check if full name is empty
    if (!fullName.trim()) newErrors.fullName = "Full name is required.";
    // Check if username is empty
    if (!username.trim()) newErrors.username = "Username is required.";
    // Check if password is valid
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      // Example: minimum 6 characters
      newErrors.password = "Password must be at least 6 characters.";
    } else if (password !== confirmPassword) {
      newErrors.password = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return; // Stop submission if validation fails

    console.log("Form submitted");

    //TODO: Add user to Firebase Authentication and Database
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
      {errors.fullName && <div className={styles.error}>{errors.fullName}</div>}

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
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {errors.password && <div className={styles.error}>{errors.password}</div>}

      <input
        className={styles.inputField}
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
      />
      {errors.confirmPassword && (
        <div className={styles.error}>{errors.confirmPassword}</div>
      )}

      <LargeButton text="Register" type="submit" onClick={handleSubmit} />
    </form>
  );
}

export default RegistrationForm;
