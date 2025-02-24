import React, { useState, useEffect } from "react";
import Player from "./Player";
import { fetchRandomTracks } from "../util/fetchAllTracks";
import Score from "./Score";
import CustomModal from "./CustomModal";
import Loading from "./Loading";
import RadioButton from "./RadioButton";

export default function Dashboard({ accessToken }) {
  const [millisecondsPlayed, setMillisecondsPlayed] = useState(5000);
  const [tracks, setTracks] = useState([]);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState("5000");
  const [tracksFetched, setTracksFetched] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const antiCheatMessage = (
    <p>Please finish your current game before switching modes.</p>
  );

  const radioButtonHandler = (id, milliseconds) => {
    if (score === 0) {
      setSelected(id);
      setMillisecondsPlayed(milliseconds);
    } else {
      setShowModal(true);
    }
  };

  useEffect(() => {
    const millisecondsPlayedItem = localStorage.getItem("millisecondsPlayed");
    if (millisecondsPlayedItem) {
      setSelected(millisecondsPlayedItem);
      setMillisecondsPlayed(parseInt(millisecondsPlayedItem, 10));
    }
    const fetchTracks = async () => {
      if (tracksFetched) return;

      try {
        setTracksFetched(true);
        const fetchedTracks = await fetchRandomTracks(accessToken, true);
        setTracks(fetchedTracks);
      } catch (error) {
        console.error("Error in Dashboard fetching tracks:", error.message);
      }
    };
    if (accessToken) {
      fetchTracks();
    }
    // eslint-disable-next-line
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
            id="1400"
            label="1s"
            value={1400}
            selected={selected}
            onChange={radioButtonHandler}
          />
          <RadioButton
            id="5000"
            label="5s"
            value={5000}
            selected={selected}
            onChange={radioButtonHandler}
          />
          <RadioButton
            id="10000"
            label="10s"
            value={10000}
            selected={selected}
            onChange={radioButtonHandler}
          />
        </div>
      )}

      {tracks.length === 0 && <Loading text={"Searching library..."} />}

      {tracks.length !== 0 && (
        <Player
          accessToken={accessToken}
          tracks={tracks}
          setTracks={setTracks}
          score={score}
          setScore={setScore}
          millisecondsPlayed={millisecondsPlayed}
        />
      )}
      {tracks.length !== 0 && (
        <Score scoreValue={score} millisecondsPlayed={millisecondsPlayed} />
      )}

      <CustomModal
        show={showModal}
        close={() => setShowModal(false)}
        title={<h2>No Cheating</h2>}
        bodyContent={antiCheatMessage}
      />
    </>
  );
}
