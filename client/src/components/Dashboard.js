import React, { useState } from "react";
import useAuth from "./useAuth";
import ToggleButton from "./ToggleButton";
import Player from "./Player";
import { Container } from "react-bootstrap";

export default function Dashboard({ code }) {
  const [showLyrics, setShowLyrics] = useState(false);
  const [showPlayer, setShowPlayer] = useState(true);
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
          onToggle={(state) => setShowPlayer(state)}
        />
        <ToggleButton
          text="Art"
          isToggled={false}
          onToggle={(state) => setShowArt(state)}
        />
      </Container>
      {/* {showPlayer && (
        <Player
          accessToken={accessToken}
          trackUri="https://open.spotify.com/track/03h0ioes0mfaZIeAO1fV5o?si=75f83f8706044b17"
        />
      )} */}
      {showLyrics && <p>Lyrics will be displayed here</p>}
      {showPlayer && <p>Player</p>}
      {showArt && <p>Art will be displayed here</p>}
    </>
  );
}
