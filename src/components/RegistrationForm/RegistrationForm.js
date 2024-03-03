import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

import { database } from "../../firebase";

import LargeButton from "../CustomButton/LargeButton";
import styles from "./RegistrationForm.module.css";


function RegistrationForm() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const auth = getAuth();

  const validateForm = () => {
    let newErrors = {};
    // Check if full name is empty
    if (!fullName.trim()) newErrors.fullName = "Full name is required.";
    // Check if username is empty
    if (!username.trim()) newErrors.username = "Username is required.";
    // Check if password is valid
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) { // Example: minimum 6 characters
      newErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return; // Stop submission if validation fails

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, username, password);
      // Handle user registration success
      // You might want to update Firestore with the user's full name here
    } catch (error) {
      // Handle errors, such as username already in use
      setErrors(prevErrors => ({ ...prevErrors, firebaseError: error.message }));
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input className={styles.inputField} type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" />
      {errors.fullName && <div className="error">{errors.fullName}</div>}

      <input className={styles.inputField} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      {errors.username && <div className="error">{errors.username}</div>}

      <input className={styles.inputField} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      {errors.password && <div className="error">{errors.password}</div>}
      {errors.firebaseError && <div className="error">{errors.firebaseError}</div>}

      <LargeButton text="Register" type="submit" />
    </form>
  );
}

export default RegistrationForm;
