import React, { useState, createRef, ChangeEvent, KeyboardEvent } from 'react';
import styles from './PinInput.module.css';

interface PinInputProps {
  onPinComplete: (pin: string) => void;
}

function PinInput({ onPinComplete }: PinInputProps) {
  const [pins, setPins] = useState<string[]>(Array(6).fill(''));
  const inputRefs = Array.from({ length: 6 }, () => createRef<HTMLInputElement>());

  const handlePinChange = (index: number, value: string) => {
    if (!value.match(/[0-9]/) && value !== '') return; // Ensure only numbers are allowed

    const newPins = [...pins];
    newPins[index] = value;
    setPins(newPins);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    if (newPins.every((pin) => pin.length === 1)) {
      onPinComplete(newPins.join(''));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pins[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
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
          onChange={(e: ChangeEvent<HTMLInputElement>) => handlePinChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={styles.pinInputField}
          maxLength={1}
          autoComplete="off"
        />
      ))}
    </div>
  );
}

export default PinInput;
