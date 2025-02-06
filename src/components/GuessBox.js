import React, { useState, useEffect } from "react";

function GuessBox({ placeholder, answer }) {
  const [guess, setGuess] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [pointValue, setPointValue] = useState("");

  useEffect(() => {
    // Check if the guess matches the answer
    // if (Array.isArray(answer)) {
    //   let isAnyCorrect = false;
    //   for (let i = 0; i < answer.length; i++) {
    //     isAnyCorrect = guess.toLowerCase() === answer[i].name.toLowerCase();
    //   }
    //   setIsCorrect(isAnyCorrect);
    // } else {
    setIsCorrect(guess.toLowerCase() === answer.toLowerCase());
    // }
  }, [guess, answer]); // Runs whenever `guess` or `answer` changes
  useEffect(() => {
    // Set point value based on the placeholder
    switch (placeholder) {
      case "Artist":
        setPointValue("+1");
        break;
      case "Song":
        setPointValue("+2");
        break;
      case "Album":
        setPointValue("+3");
        break;
      default:
        setPointValue("");
        break;
    }
  }, [placeholder]);

  return (
    <div className="d-flex gap-3 justify-content-center">
      <input
        className="form-control"
        style={{ width: "15rem", marginLeft: "2rem" }}
        type="text"
        placeholder={placeholder}
        value={isCorrect ? answer : guess}
        onChange={(e) => setGuess(e.target.value)}
        readOnly={isCorrect}
      />
      <h2 className="text-white">{isCorrect ? "✅" : pointValue}</h2>
    </div>
  );
}

export default GuessBox;
