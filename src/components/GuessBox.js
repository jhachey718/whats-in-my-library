import React, { useState, useEffect } from "react";
import { similarityPercentage } from "../util/guessValidator";
function GuessBox({ placeholder, answer, setShowArt }) {
  const [guess, setGuess] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [pointValue, setPointValue] = useState("");
  const [answerString, setAnswerString] = useState("");
  useEffect(() => {
    if (isCorrect && setShowArt) {
      setShowArt(true);
    }
  }, [isCorrect]);
  useEffect(() => {
    // Check if the guess matches the answer
    if (Array.isArray(answer)) {
      setIsCorrect(
        answer.some(
          (ans) =>
            similarityPercentage(
              guess.toLowerCase().trim(),
              ans.name.toLowerCase().trim()
            ) >= 85
        )
      );
    } else {
      setIsCorrect(
        similarityPercentage(
          guess.toLowerCase().trim(),
          answer.toLowerCase().trim()
        ) >= 85
      );
    }
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
        setPointValue("+0");
        break;
    }
  }, [placeholder]);
  useEffect(() => {
    setGuess("");
    if (Array.isArray(answer)) {
      setAnswerString(answer.map((a) => a.name).join(", "));
    } else {
      setAnswerString(answer);
    }
  }, [answer]);

  return (
    <div className="d-flex gap-3 justify-content-center">
      <input
        className="form-control"
        style={{ width: "15rem", marginLeft: "2rem" }}
        type="text"
        placeholder={placeholder}
        value={isCorrect ? answerString : guess}
        onChange={(e) => setGuess(e.target.value)}
        readOnly={isCorrect}
      />
      <h2 className="text-white">{isCorrect ? "✅" : pointValue}</h2>
    </div>
  );
}

export default GuessBox;
