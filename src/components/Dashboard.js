import React, { useState, useEffect } from "react";
import ToggleButton from "./ToggleButton";
import PlayButton from "./PlayButton";
import { Container } from "react-bootstrap";
import { fetchRandomTracks } from "../fetchAllTracks";
import shuffle from "../shuffle";
import Score from "./Score";

export default function Dashboard({ accessToken }) {
  const [showLyrics, setShowLyrics] = useState(false);
  const [showArt, setShowArt] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [score, setScore] = useState(0);
  useEffect(() => {
    const fetchTracks = async () => {
      if (tracks.length > 0) return;
      try {
        // const fetchedTracks = await fetchAllTracks(accessToken);
        const fetchedTracks = await fetchRandomTracks(accessToken);
        console.log("Fetched tracks:", fetchedTracks);
        // setTracks(shuffle(fetchedTracks));
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
      {tracks.length === 0 && (
        <h2 className="text-white">Fetching Tracks...</h2>
      )}
      <Container
        className="d-inline-flex gap-3 justify-content-center"
        style={{ marginTop: "1rem" }}
      >
        {/* <ToggleButton
          text="Lyrics"
          isToggled={false}
          onToggle={(state) => setShowLyrics(state)}
        />
        <ToggleButton
          text="Art"
          isToggled={false}
          onToggle={(state) => setShowArt(state)}
        /> */}
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
