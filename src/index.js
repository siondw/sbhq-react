import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import RegistrationScreen from "./screens/Registration/RegistrationScreen";
import LoginScreen from "./screens/Login/LoginScreen";
import PregameScreen from "./screens/Pregame/PregameScreen";

import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/register" element={<RegistrationScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/pregame" element={<PregameScreen />} />
        {/* Redirect to /login as the default route */}
        <Route path="/" element={<Navigate replace to="/pregame" />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
