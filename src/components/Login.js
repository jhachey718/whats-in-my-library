import React from "react";
import { Container } from "react-bootstrap";

const AUTH_URL =
  "https://accounts.spotify.com/authorize?client_id=cc17611a148a4eb3a5efe73693e86db9&response_type=code&redirect_uri=http://localhost:3000&scope=user-library-read%20streaming%20user-read-email%20user-read-private%20user-read-playback-state%20user-modify-playback-state";

export default function Login() {
  return (
    <Container
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
        href={AUTH_URL}
      >
        Login With Spotify
      </a>
    </Container>
  );
}
