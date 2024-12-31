import React from "react";

const ToggleButton = ({ text, isToggled }) => {
  return (
    <button
      type="button"
      className={`btn btn-dark btn-large fs-4 ${isToggled ? "active" : ""}`}
      data-bs-toggle="button"
      aria-pressed={isToggled}
    >
      {text}
    </button>
  );
};

export default ToggleButton;
