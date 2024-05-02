import React from 'react';
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import AnswersContainer from "../../components/AnswersContainer/AnswersContainer";
import styles from "./QuestionScreen.module.css";

function QuestionScreen() {
  var roundNumber = "1";
  var questionText = "What will be the result of this drive?";  // Mock question text
  const questionAnswers = ["Field Goal", "Touchdown", "Punt", "Other"];

  return (
    <div className={styles.questionScreen}>
      <div className={styles.questionHeader}>
        <Header />
      </div>
      <div className={styles.screenContent}>
        <MainText
          header={`Round ${roundNumber}`}
          subheader="Choose Wisely"
        />
        <div className={styles.questionText}>{questionText}</div> {/* Displaying the question text */}
        <AnswersContainer answers={questionAnswers} />
      </div>
    </div>
  );
}

export default QuestionScreen;
