import RegistrationForm from "../../components/RegistrationForm/RegistrationForm";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";

import styles from "./RegistrationScreen.module.css";

function RegistrationScreen() {
  return (
    <div className={styles.registrationScreen}> 
      <div className={styles.registrationHeader}>
        <Header /> 
      </div> 
      <div className={styles.screenContent}>
        <MainText header="Sign Up" subheader="Have an account? " linkPath={"/login"} linkText={"Sign in Here"}/> 
        <RegistrationForm /> 
      </div>
    </div>
  );
}

export default RegistrationScreen;
