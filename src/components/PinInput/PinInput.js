import React, { useState, createRef } from 'react';
import styles from './PinInput.module.css';  // Import the CSS module

function PinInput({ onPinComplete }) {
  const [pins, setPins] = useState(Array(6).fill(""));
  const inputRefs = Array(6).fill().map(() => createRef());

  const handlePinChange = (index, value) => {
    if (!value.match(/[0-9]/) && value !== "") return;  // Ensure only numbers are allowed

    const newPins = [...pins];
    newPins[index] = value;  // Capture the number
    setPins(newPins);

    // Focus management
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();  // Move to the next field
    }

    // Check if all pins are filled
    if (newPins.every(pin => pin.length === 1)) {
      onPinComplete(newPins.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !pins[index] && index > 0) {
      inputRefs[index - 1].current.focus();  // Move focus to the previous field
    }
  };

  return (
    <div className={styles.pinInputContainer}>
      {pins.map((pin, index) => (
        <input
          key={index}
          ref={inputRefs[index]}
          type="text"
          value={pin}
          onChange={(e) => handlePinChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={styles.pinInputField}
          maxLength="1"
          autoComplete="off"
        />
      ))}
    </div>
  );
}

export default PinInput;
