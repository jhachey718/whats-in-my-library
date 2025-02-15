import React from "react";

function LoginButton() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "75vh" }}
    >
      <a
        className="btn btn-dark"
        style={{
          "--bs-btn-padding-y": "1.5rem",
          "--bs-btn-padding-x": "2.5rem",
          "--bs-btn-font-size": "2rem",
          backgroundColor: "rgba(0, 0, 0, 0.35)", // Semi-transparent black
          color: "#fff",
        }}
        href="/.netlify/functions/login"
      >
        Login With Spotify
      </a>
    </div>
  );
}

export default LoginButton;
