import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import RegistrationScreen from "./screens/Registration/RegistrationScreen";
import LoginScreen from "./screens/Login/LoginScreen";
import PregameScreen from "./screens/Pregame/PregameScreen";
import QuestionScreen from "./screens/Question/QuestionScreen";
import SubmittedScreen from "./screens/Submitted/SubmittedScreen";
import CorrectScreen from "./screens/Correct/CorrectScreen";
import EliminatedScreen from "./screens/Eliminated/EliminatedScreen";

import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/register" element={<RegistrationScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/pregame" element={<PregameScreen />} />
        <Route path="/question" element={<QuestionScreen />} />
        <Route path="/submitted" element={<SubmittedScreen />} />
        <Route path="/correct" element={<CorrectScreen />} />
        <Route path="/eliminated" element={<EliminatedScreen />} />
        {/* Redirect to /login as the default route */}
        <Route path="/" element={<Navigate replace to="/pregame" />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
