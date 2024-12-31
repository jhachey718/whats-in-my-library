import React, { useState } from "react";
import useAuth from "./useAuth";
import ToggleButton from "./ToggleButton";
import Player from "./Player";
import { Container } from "react-bootstrap";

export default function Dashboard({ code }) {
  const [showLyrics, setShowLyrics] = useState(false);
  const [showListen, setShowListen] = useState(false);
  const [showArt, setShowArt] = useState(false);
  const accessToken = useAuth(code);
  return (
    <>
      <Container
        className="d-inline-flex gap-3 justify-content-center"
        style={{ marginTop: "2rem" }}
      >
        <ToggleButton
          text="Lyrics"
          isToggled={false}
          onToggle={(state) => setShowLyrics(state)}
        />
        <ToggleButton
          text="Listen"
          isToggled={true}
          onToggle={(state) => setShowListen(state)}
        />
        <ToggleButton
          text="Art"
          isToggled={false}
          onToggle={(state) => setShowArt(state)}
        />
      </Container>
    </>
  );
}
