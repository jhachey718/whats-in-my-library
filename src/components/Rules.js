import React, { useState } from "react";
import CustomModal from "./CustomModal";
import "./Rules.css";

function Rules() {
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const rulesContent = (
    <>
      <h3>How to Play</h3>
      <ol>
        <li>
          Listen to a randomly selected song clip from
          <strong>your Spotify Library</strong>.
        </li>
        <li>
          Guess the <strong>title, artist, and album</strong> to score points.
        </li>
        <li>
          Click <strong>Reveal Answers</strong> if needed (no penalty if you
          guessed at least one part).
        </li>
        <li>
          Click <strong>Refresh Library</strong> if you updated your Spotify
          Library or you just want some new songs.
        </li>
        <li>Keep going and see how many you can get right!</li>
      </ol>

      <h3>Game Modes</h3>
      <ul>
        <li>
          ♫ <strong>1 Second Mode</strong>
        </li>
        <li>
          ♫ <strong>5 Second Mode</strong>
        </li>
        <li>
          ♫ <strong>10 Second Mode</strong>
        </li>
      </ul>
      <p>Each mode has its own score and high score.</p>

      <h3>Scoring</h3>
      <ul>
        <li>
          ✅ <strong>Correct Guess</strong> → Keep your score. Progress is kept
          even after refreshing the page!
        </li>
        <li>
          ❌ <strong>Miss Everything</strong> → Score resets to 0.
        </li>
      </ul>

      <h3>Notes</h3>
      <p>
        For best experience do <strong>not</strong> play on private/incognito
        browser. This app relies on the browser's storage to save score and
        songs.
      </p>
      <p>
        Sorry for any bugs. Pressing the refresh button in the top left should
        fix most of them.
      </p>
    </>
  );

  return (
    <>
      <button className="rules-button" onClick={handleShow}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
          <path d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"></path>
        </svg>
      </button>

      <CustomModal
        show={showModal}
        close={handleClose}
        title={<h2>Rules</h2>}
        bodyContent={rulesContent}
      ></CustomModal>
    </>
  );
}

export default Rules;
