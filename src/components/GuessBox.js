import React, { useState, useEffect } from "react";
import { similarityPercentage } from "../util/guessValidator";
function GuessBox({
  placeholder,
  answer,
  setShowArt,
  revealAnswer,
  setScore,
  attempt,
}) {
  const [guess, setGuess] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [pointValue, setPointValue] = useState("");
  const [answerString, setAnswerString] = useState("");
  useEffect(() => {
    if (revealAnswer) {
      setIsCorrect(true);
    }
    if (setShowArt && revealAnswer) {
      setShowArt(true);
    }
  }, [revealAnswer, setShowArt]);
  useEffect(() => {
    if (isCorrect && setShowArt) {
      setShowArt(true);
    }
    if (isCorrect && !revealAnswer) {
      switch (placeholder) {
        case "Artist":
          setScore((prevScore) => prevScore + 1);
          break;
        case "Song":
          setScore((prevScore) => prevScore + 2);
          break;
        case "Album":
          setScore((prevScore) => prevScore + 3);
          break;
        default:
          setScore((prevScore) => prevScore + 0);
          break;
      }
    }
    // eslint-disable-next-line
  }, [isCorrect]);
  useEffect(() => {
    if (placeholder === "Album" || placeholder === "Song") {
      let newAnswer = "";
      if (placeholder === "Album") {
        newAnswer = answer.toLowerCase().split(/ -|\(/)[0].trim();
      } else {
        newAnswer = answer
          .toLowerCase()
          .split(/ - | \(feat| \(remast/i)[0]
          .trim();
      }
      setIsCorrect(
        similarityPercentage(guess.toLowerCase().trim(), newAnswer) >= 85
      );
    }
    // Check if the guess matches the answer
    else if (Array.isArray(answer)) {
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
  }, [guess, answer, placeholder]);
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
    setIsCorrect(false);
    if (setShowArt) {
      setShowArt(false);
    }
    if (Array.isArray(answer)) {
      setAnswerString(answer.map((a) => a.name).join(", "));
    } else {
      setAnswerString(answer);
    }
  }, [answer, setShowArt, attempt]);

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
