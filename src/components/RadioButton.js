import React from "react";

function RadioButton({ id, label, value, selected, onChange }) {
  return (
    <label className={`btn btn-dark btn-lg ${selected === id ? "active" : ""}`}>
      <input
        type="radio"
        name="options"
        id={id}
        autoComplete="off"
        checked={selected === id}
        onChange={() => onChange(id, value)}
        style={{ display: "none" }}
      />
      {label}
    </label>
  );
}

export default RadioButton;
