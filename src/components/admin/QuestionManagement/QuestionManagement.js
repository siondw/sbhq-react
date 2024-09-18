import React, { useState } from 'react';
import styles from './QuestionManagement.module.css';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: 'Who will score the first touchdown?',
      options: ['Player A', 'Player B', 'Player C', 'Player D'],
      correctOption: null, // No correct answer yet
    },
    {
      id: 2,
      text: 'How many field goals will be scored?',
      options: ['0', '1', '2', '3+'],
      correctOption: null, // No correct answer yet
    },
  ]);

  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
  });

  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const handleAddQuestion = () => {
    const newId = questions.length + 1;
    setQuestions([...questions, { id: newId, ...newQuestion, correctOption: null }]);
    setNewQuestion({ text: '', options: ['', '', '', ''] });
  };

  const handleEditQuestion = (id) => {
    setEditingQuestionId(id);
  };

  const handleSetCorrectAnswer = (id, answer) => {
    const updatedQuestions = questions.map((question) =>
      question.id === id ? { ...question, correctOption: answer } : question
    );
    setQuestions(updatedQuestions);
    setEditingQuestionId(null); // Close the editing mode
  };

  const handleInputChange = (e, index) => {
    const options = [...newQuestion.options];
    options[index] = e.target.value;
    setNewQuestion({ ...newQuestion, options });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Question Management</h2>

      {/* Table to display current questions */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Question</th>
            <th>Options</th>
            <th>Correct Answer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question) => (
            <tr key={question.id}>
              <td>{question.text}</td>
              <td>{question.options.join(', ')}</td>
              <td>
                {question.correctOption ? question.correctOption : 'Not set'}
              </td>
              <td>
                {editingQuestionId === question.id ? (
                  <div className={styles.editContainer}>
                    <select
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      className={styles.input}
                    >
                      <option value="">Select Correct Answer</option>
                      {question.options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleSetCorrectAnswer(question.id, correctAnswer)}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditQuestion(question.id)}
                    >
                      Set Correct Answer
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form to add new question */}
      <div className={styles.newQuestionContainer}>
        <h3>Add New Question</h3>
        <input
          type="text"
          className={styles.input}
          placeholder="Question Text"
          value={newQuestion.text}
          onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
        />
        <div className={styles.options}>
          {newQuestion.options.map((option, index) => (
            <input
              key={index}
              type="text"
              className={styles.input}
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleInputChange(e, index)}
            />
          ))}
        </div>
        <button className={styles.addButton} onClick={handleAddQuestion}>
          Add Question
        </button>
      </div>
    </div>
  );
};

export default QuestionManagement;
