import React, { useState, useEffect } from "react";
import useAuth from "../useAuth";
import ToggleButton from "./ToggleButton";
import Player from "./Player";
import { Container } from "react-bootstrap";
import { fetchAllTracks } from "../fetchAllTracks";
import fetchRandomTrack from "../fetchRandomTrack";

export default function Dashboard({ code }) {
  const [showLyrics, setShowLyrics] = useState(false);
  const [showPlayer, setShowPlayer] = useState(true);
  const [showArt, setShowArt] = useState(false);
  const accessToken = useAuth(code);
  let tracks;
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        tracks = await fetchAllTracks(accessToken);
        console.log("Fetched tracks:", tracks);
      } catch (error) {
        console.error("Error in Dashboard fetching tracks:", error.message);
      }
    };

    if (accessToken) {
      fetchTracks();
    }
  }, [accessToken]);

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
          trackUri="spotify:track:4YA6OM2rLH1jlLUJpJ6j3u"
        />
      )} */}
      {showLyrics && <p>no</p>}
      {showPlayer && <p>Player</p>}
      {showArt && <p>Art will be displayed here</p>}
    </>
  );
}
