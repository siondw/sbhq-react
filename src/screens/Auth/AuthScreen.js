import React from "react";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import AuthForm from "../../components/AuthForm/AuthForm";
import styles from "./AuthScreen.module.css";

function AuthScreen() {
  return (
    <div className={styles.authScreen}>
      <div className={styles.header}>
        <Header />
      </div>
      <div className={styles.screenContent}>
        <MainText
          header="Welcome!"
          subheader="Enter your email to continue."
        />
        <AuthForm />
      </div>
    </div>
  );
}

export default AuthScreen;
