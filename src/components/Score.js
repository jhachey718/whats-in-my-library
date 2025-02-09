import React, { useState, useEffect } from "react";
function Score({ scoreValue }) {
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    // Load high score from localStorage
    const storedHighScore = localStorage.getItem("highScore");
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    // Update high score if current score is greater
    if (scoreValue > highScore) {
      localStorage.setItem("highScore", scoreValue);
      setHighScore(scoreValue);
    }
  }, [scoreValue, highScore]);
  return (
    <div
      className="d-inline-flex gap-5 justify-content-center text-white"
      style={{ marginTop: "1rem" }}
    >
      <h2>Score: {scoreValue}</h2>
      <h2>Highscore: {highScore}</h2>
    </div>
  );
}

export default Score;
