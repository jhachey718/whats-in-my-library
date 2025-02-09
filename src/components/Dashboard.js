import React, { useState, useEffect } from "react";
import ToggleButton from "./ToggleButton";
import PlayButton from "./PlayButton";
import { Container } from "react-bootstrap";
import { fetchAllTracks } from "../fetchAllTracks";
import shuffle from "../shuffle";
import Score from "./Score";

export default function Dashboard({ code }) {
  const [showLyrics, setShowLyrics] = useState(false);
  const [showArt, setShowArt] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [score, setScore] = useState(0);
  const accessToken = code;
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const fetchedTracks = await fetchAllTracks(accessToken);
        console.log("Fetched tracks:", fetchedTracks);
        setTracks(shuffle(fetchedTracks));
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
        style={{ marginTop: "1rem" }}
      >
        <ToggleButton
          text="Lyrics"
          isToggled={false}
          onToggle={(state) => setShowLyrics(state)}
        />
        <ToggleButton
          text="Art"
          isToggled={false}
          onToggle={(state) => setShowArt(state)}
        />
      </Container>
      {tracks.length !== 0 && (
        <PlayButton
          accessToken={accessToken}
          tracks={tracks}
          setScore={setScore}
        />
      )}
      <Score scoreValue={score} />
    </>
  );
}
