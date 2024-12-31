import React from "react";
import useAuth from "./useAuth";
import ToggleButton from "./ToggleButton";
import { Container } from "react-bootstrap";

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  return (
    <Container
      className="d-flex flex-column align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <h1 className="text-center text-white" style={{ marginTop: "2rem" }}>
        What's In My Library
      </h1>
      <p className="d-inline-flex gap-3" style={{ marginTop: "2rem" }}>
        <ToggleButton text="Lyrics" isToggled={false} />
        <ToggleButton text="Listen" isToggled={true} />
        <ToggleButton text="Art" isToggled={false} />
      </p>
    </Container>
  );
}
