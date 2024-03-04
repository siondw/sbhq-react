import LoginForm from "../../components/LoginForm/LoginForm";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";

import styles from "../Registration/RegistrationScreen.module.css";


// Don't get gazzed, the code is almost the same as the RegistrationScreen.js file
// Because we're reusing the styling from the RegistrationScreen.module.css file

function LoginScreen() {
    return (
      <div className={styles.registrationScreen}> 
        <div className={styles.registrationHeader}>
          <Header /> 
        </div> 
        <div className={styles.screenContent}>
          <MainText header="Sign In" subheader="Don't have an account? " linkPath={"/register"} linkText={"Create One Here!"} /> 
          <LoginForm /> 
        </div>
      </div>
    );
  }
  

  export default LoginScreen;