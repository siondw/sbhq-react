import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import LargeButton from "../../components/LargeButton/LargeButton";

import styles from "./QuestionScreen.module.css";

function QuestionScreen() {

    roundNumber = "1";


    return (
        <div className={styles.questionScreen}>
        <div className={styles.questionHeader}>
            <Header />
        </div>
        <div className={styles.screenContent}>
            <MainText header={`Round = ${roundNumber}`} subheader="Choose Wisely" ></MainText>
        </div>
        </div>
    );
}

export default QuestionScreen;