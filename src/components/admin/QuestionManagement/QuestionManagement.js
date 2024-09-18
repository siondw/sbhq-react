// QuestionManagement.js
import React, { useState } from 'react';

const QuestionManagement = () => {
  const [questions] = useState([
    { id: 1, text: "What will be the result of the first drive?", options: ["Touchdown", "Field Goal", "Punt", "Turnover"] },
    { id: 2, text: "Which team will score first?", options: ["Home Team", "Away Team"] },
  ]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-4">Question Management</h2>
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Add New Question
      </button>
      <div className="mt-6">
        {questions.map((question) => (
          <div key={question.id} className="bg-gray-800 p-4 rounded-md shadow-sm mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">{question.text}</h3>
            <div className="grid grid-cols-2 gap-2">
              {question.options.map((option, index) => (
                <div key={index} className="bg-gray-700 p-2 rounded">{option}</div>
              ))}
            </div>
            <div className="mt-4">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded mr-2">
                Edit
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionManagement;
