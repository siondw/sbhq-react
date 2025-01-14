import React, { useState } from "react";
import LargeButton from "../CustomButton/LargeButton";
import styles from "./AuthForm.module.css";
import { supabase } from "../../supabase";

function AuthForm() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }

    try {
      // Use the environment variable for the redirect URL
      const redirectUrl = process.env.REACT_APP_REDIRECT_URL;
      console.log("Redirect URL:", redirectUrl);

      // Use your `signInWithEmail` logic here
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl, // Dynamically set redirect URL
        },
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "Magic link sent! Check your email to log in or register."
      );
    } catch (error) {
      setErrorMessage(error.message || "Failed to send magic link.");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.inputField}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}
      <LargeButton text="Send Magic Link" type="submit" />
    </form>
  );
}

export default AuthForm;
