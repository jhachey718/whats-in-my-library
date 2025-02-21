import React, { useState, useEffect } from "react";
function Score({ scoreValue, millisecondsPlayed }) {
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    setHighScore(0);
    const storedHighScore = localStorage.getItem(
      `${millisecondsPlayed}highScore`
    );
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, [millisecondsPlayed]);

  useEffect(() => {
    // Update high score if current score is greater
    if (scoreValue > highScore) {
      localStorage.setItem(`${millisecondsPlayed}highScore`, scoreValue);
      setHighScore(scoreValue);
    }
    // eslint-disable-next-line
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
