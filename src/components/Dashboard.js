import React, { useState, useEffect } from "react";
import Player from "./Player";
import { fetchRandomTracks } from "../fetchAllTracks";
import Score from "./Score";
import RadioButton from "./RadioButton";

export default function Dashboard({ accessToken }) {
  const [millisecondsPlayed, setMillisecondsPlayed] = useState(5000);
  const [tracks, setTracks] = useState([]);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState("2");

  const radioButtonHandler = (id, milliseconds) => {
    setSelected(id);
    setMillisecondsPlayed(milliseconds);
    console.log(milliseconds);
  };
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
      {tracks.length !== 0 && (
        <div
          className="btn-group btn-group-toggle d-inline-flex justify-content-center"
          data-toggle="buttons"
          style={{ marginTop: "1rem" }}
        >
          <RadioButton
            id="1"
            label="1s"
            value={1000}
            selected={selected}
            onChange={radioButtonHandler}
          />
          <RadioButton
            id="2"
            label="5s"
            value={5000}
            selected={selected}
            onChange={radioButtonHandler}
          />
          <RadioButton
            id="3"
            label="10s"
            value={10000}
            selected={selected}
            onChange={radioButtonHandler}
          />
        </div>
      )}

      {tracks.length === 0 && (
        <h2 className="text-white position-absolute top-50 start-50 translate-middle">
          Fetching Tracks...
        </h2>
      )}

      {tracks.length !== 0 && (
        <Player
          accessToken={accessToken}
          tracks={tracks}
          score={score}
          setScore={setScore}
          millisecondsPlayed={millisecondsPlayed}
        />
      )}
      {tracks.length !== 0 && <Score scoreValue={score} />}
    </>
  );
}
