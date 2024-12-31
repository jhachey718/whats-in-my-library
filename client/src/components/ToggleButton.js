import React, { useState, newState } from "react";

const ToggleButton = ({ text, isToggled, onToggle }) => {
  const [toggled, setToggled] = useState(isToggled);

  const handleToggle = () => {
    setToggled((prev) => !prev);
    onToggle(newState);
  };

  return (
    <button
      type="button"
      className={`btn btn-dark btn-large fs-4 ${toggled ? "active" : ""}`}
      data-bs-toggle="button"
      aria-pressed={toggled}
      onClick={handleToggle}
    >
      {text}
    </button>
  );
};

export default ToggleButton;
