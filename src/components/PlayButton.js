import React, { useEffect, useState } from "react";
import GuessBox from "./GuessBox";
import "./PlayButton.css";

function PlayButton({ accessToken, tracks, showArt }) {
  const [player, setPlayer] = useState(undefined);
  const [deviceId, setDeviceId] = useState(null);
  const [isPaused, setPaused] = useState(true);
  const [isPlayerStarted, setPlayerStarted] = useState(false);
  const [trackUris, setTrackUris] = useState([]);
  const [albumArt, setAlbumArt] = useState("");
  const [tracksPosition, setTracksPositon] = useState(0);
  const [isCooldown, setCooldown] = useState(false);

  useEffect(() => {
    let uris = [];
    for (let i = 0; i < tracks.length; i++) {
      uris.push(tracks[i].uri);
    }
    const existingScript = document.querySelector(
      "script[src='https://sdk.scdn.co/spotify-player.js']"
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => cb(accessToken),
        volume: 0.5,
      });
      setAlbumArt(tracks[tracksPosition].album.images[1].url);
      setPlayer(player);
      setTrackUris(uris);

      player.addListener("ready", ({ device_id }) => {
        console.log("Player is ready with Device ID", device_id);
        setDeviceId(device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        setPaused(state.paused);
      });

      player.connect();
    };
    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken, player]);

  const nextButtonHandler = async () => {
    if (isCooldown || !isPlayerStarted) return;

    setCooldown(true);
    setTimeout(() => {
      setCooldown(false);
    }, 3000);
    await player.pause();
    await player.setVolume(0.0);
    await player.nextTrack();
    setPaused(true);
    setTracksPositon((prev) => {
      const newPosition = prev + 1;
      setAlbumArt(tracks[newPosition].album.images[1].url);
      setTimeout(async () => {
        await player.seek(Number(tracks[newPosition].duration_ms / 2));
        await player.pause();
        await player.setVolume(0.5);
      }, 1000);
      return newPosition;
    });
  };

  const playButtonHandler = () => {
    if (!isPlayerStarted) {
      console.log("Starting playback");
      playTrack();
      setPaused(false);
    } else if (isPaused) {
      console.log("Resuming playback");
      player.togglePlay();
      setPaused(false);
    } else {
      console.log("Pausing playback");
      player.togglePlay();
      setPaused(true);
    }
  };

  const playTrack = async () => {
    if (!deviceId) {
      console.error("Device ID is not set.");
      return;
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: trackUris,
          }),
        }
      );

      if (response.ok) {
        console.log("Playback started");
        player.addListener("player_state_changed", (state) => {
          if (state && !state.paused && state.position === 0) {
            setTimeout(() => {
              player
                .seek(Number(tracks[tracksPosition].duration_ms / 2))
                .then(() => {
                  console.log("Seeked to halfway point");
                })
                .catch((err) => console.error("Error seeking:", err));
            }, 500);

            setPlayerStarted(true);

            player.removeListener("player_state_changed");
          }
        });
      } else {
        console.error("Failed to start playback:", response.statusText);
      }
    } catch (error) {
      console.error("Error starting playback:", error.message);
    }
  };

  if (isPlayerStarted) {
    const positionCheckInterval = setInterval(async () => {
      const state = await player.getCurrentState();
      if (state) {
        const currentPosition = state.position; // Current playback position in ms

        if (
          currentPosition >=
          Number(tracks[tracksPosition].duration_ms / 2) + 10000
        ) {
          clearInterval(positionCheckInterval); // Stop the interval
          player.pause().then(() => {
            setPaused(true);
            player.seek(Number(tracks[tracksPosition].duration_ms / 2));
          });
        }
      }
    }, 100);
  }

  return (
    <div
      className="play-button d-inline-flex flex-column gap-4 justify-content-center"
      style={{ marginTop: "2rem" }}
    >
      {albumArt && (
        <div className="d-flex justify-content-center">
          <img
            src={showArt ? albumArt : "/default-cover-art.png"}
            alt="Album Art"
            width="250"
            height="250"
          />
        </div>
      )}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ gap: "7rem" }}
      >
        <div className="d-flex justify-content-center">
          <label className="container">
            <input
              type="checkbox"
              checked={!isPaused}
              onChange={playButtonHandler}
            />
            <svg
              className="play"
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 384 512"
            >
              <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"></path>
            </svg>
            <svg
              className="pause"
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 320 512"
            >
              <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"></path>
            </svg>
          </label>
        </div>
        <div className="d-flex justify-content-center">
          <button
            className="Btn"
            onClick={nextButtonHandler}
            disabled={isCooldown}
          >
            <svg viewBox="0 0 320 512" className="svg" height="3.5em">
              <path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="d-inline-flex flex-column gap-3 justify-content-center">
        <GuessBox
          placeholder="Artist"
          answer={tracks[tracksPosition].artists}
        />
        <GuessBox placeholder="Song" answer={tracks[tracksPosition].name} />
        <GuessBox
          placeholder="Album"
          answer={tracks[tracksPosition].album.name}
        />
      </div>
    </div>
  );
}

export default PlayButton;
