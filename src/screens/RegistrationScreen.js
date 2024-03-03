import RegistrationForm from "../components/RegistrationForm/RegistrationForm";
import Header from "../components/Header/Header";

function RegistrationScreen() {
  return (
    <div className="registrationScreen">
      <div className="registrationHeader">
        <Header />
        <RegistrationForm />
      </div>
    </div>
  );
}

export default RegistrationScreen;
