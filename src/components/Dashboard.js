import React, { useState, useEffect } from "react";
import useAuth from "../useAuth";
import ToggleButton from "./ToggleButton";
import PlayButton from "./PlayButton";
import { Container } from "react-bootstrap";
import { fetchAllTracks } from "../fetchAllTracks";
import fetchRandomTrack from "../fetchRandomTrack";

export default function Dashboard({ code }) {
  const [showLyrics, setShowLyrics] = useState(false);
  const [showPlayer, setShowPlayer] = useState(true);
  const [showArt, setShowArt] = useState(false);
  const [tracks, setTracks] = useState([]);
  const accessToken = code;
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const fetchedTracks = await fetchAllTracks(accessToken);
        console.log("Fetched tracks:", fetchedTracks);
        console.log("Random track:", fetchRandomTrack(fetchedTracks).name);
        setTracks(fetchedTracks);
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
      {showPlayer && tracks.length !== 0 && (
        <PlayButton
          accessToken={accessToken}
          trackUri={fetchRandomTrack(tracks).uri}
        />
      )}
      {showLyrics && <p>no</p>}
      {showPlayer && <p>Player</p>}
      {showArt && tracks.length !== 0 && <p>{fetchRandomTrack(tracks).name}</p>}
    </>
  );
}
