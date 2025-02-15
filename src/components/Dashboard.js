import React, { useState, useEffect } from "react";
import ToggleButton from "./ToggleButton";
import Player from "./Player";
import { Container } from "react-bootstrap";
import { fetchRandomTracks } from "../fetchAllTracks";
import shuffle from "../shuffle";
import Score from "./Score";

export default function Dashboard({ accessToken }) {
  const [millisecondsPlayed, setMillisecondsPlayed] = useState(1000);
  const [tracks, setTracks] = useState([]);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState("option1");
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
      <div
        className="btn-group btn-group-toggle d-inline-flex justify-content-center"
        data-toggle="buttons"
        style={{ marginTop: "1rem" }}
      >
        <label
          className={`btn btn-dark ${selected === "option1" ? "active" : ""}`}
        >
          <input
            type="radio"
            name="options"
            id="option1"
            autoComplete="off"
            checked={selected === "option1"}
            onChange={() => setSelected("option1")}
            style={{ display: "none" }}
          />
          1s
        </label>
        <label
          className={`btn btn-dark ${selected === "option2" ? "active" : ""}`}
        >
          <input
            type="radio"
            name="options"
            id="option2"
            autoComplete="off"
            checked={selected === "option2"}
            onChange={() => setSelected("option2")}
            style={{ display: "none" }}
          />
          5s
        </label>
        <label
          className={`btn btn-dark ${selected === "option3" ? "active" : ""}`}
        >
          <input
            type="radio"
            name="options"
            id="option3"
            autoComplete="off"
            checked={selected === "option3"}
            onChange={() => setSelected("option3")}
            style={{ display: "none" }}
          />
          10s
        </label>
      </div>

      {tracks.length !== 0 && (
        <Player
          accessToken={accessToken}
          tracks={tracks}
          score={score}
          setScore={setScore}
          millisecondsPlayed={millisecondsPlayed}
        />
      )}
      <Score scoreValue={score} />
    </>
  );
}
