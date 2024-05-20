import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/Header/Header';
import MainText from '../../components/MainText/MainText';
import AnswersContainer from '../../components/AnswersContainer/AnswersContainer';
import styles from './QuestionScreen.module.css';

function QuestionScreen() {
  const location = useLocation();
  const { contest } = location.state; // Get contest details from state

  const roundNumber = contest.currentRound;
  const currentQuestion = contest.questions.find(question => question.round === roundNumber);
  const questionText = currentQuestion ? currentQuestion.question : "No question available";  
  const questionAnswers = currentQuestion ? currentQuestion.options : [];

  return (
    <div className={styles.questionScreen}>
      <div className={styles.header}>
        <Header />
      </div>
      <div className={styles.screenContent}>
        <MainText
          header={`Round ${roundNumber}`}
          subheader="Choose Wisely!"
        />
        <div className={styles.questionBlock}> 
          <div className={styles.questionText}>{questionText}</div> 
          <AnswersContainer answers={questionAnswers} />
        </div>
      </div>
    </div>
  );
}

export default QuestionScreen;
