import React from "react";
import useAuth from "./useAuth";
import ToggleButton from "./ToggleButton";
import { Container } from "react-bootstrap";

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  return (
    <Container
      className="d-inline-flex gap-3 justify-content-center"
      style={{ marginTop: "2rem" }}
    >
      <ToggleButton text="Lyrics" isToggled={false} />
      <ToggleButton text="Listen" isToggled={true} />
      <ToggleButton text="Art" isToggled={false} />
    </Container>
  );
}
