import React, { useEffect, useState, useRef } from "react";
import GuessBox from "./GuessBox";
import PlayButton from "./PlayButton";
import NextButton from "./NextButton";
import Loading from "./Loading";
import { fetchRandomTracks } from "../util/fetchAllTracks";

function Player({
  accessToken,
  tracks,
  setTracks,
  score,
  setScore,
  millisecondsPlayed,
}) {
  const [player, setPlayer] = useState(undefined);
  const [deviceId, setDeviceId] = useState(null);
  const [isPaused, setPaused] = useState(true);
  const [isPlayerStarted, setPlayerStarted] = useState(false);
  const [trackUris, setTrackUris] = useState([]);
  const [albumArt, setAlbumArt] = useState("");
  const [tracksPosition, setTracksPosition] = useState(0);
  const [isCooldown, setCooldown] = useState(false);
  const [showArt, setShowArt] = useState(false);
  const [revealAnswers, setRevealAnswers] = useState(false);
  const [prevScore, setPrevScore] = useState(0);
  const [awaitingTracks, setAwaitingTracks] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const positionCheckIntervalRef = useRef(null);
  const startTime = 20000; //in milliseconds

  useEffect(() => {
    localStorage.setItem("millisecondsPlayed", millisecondsPlayed);
    const scoreItem = localStorage.getItem(`${millisecondsPlayed}score`);
    if (scoreItem) {
      setScore(parseInt(scoreItem, 10));
      setPrevScore(parseInt(scoreItem, 10));
    } else {
      setScore(0);
      setPrevScore(0);
    }
  }, [millisecondsPlayed, setScore]);

  useEffect(() => {
    let uris = [];
    for (let i = 0; i < tracks.length; i++) {
      uris.push(tracks[i].uri);
    }
    setTrackUris(uris);
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
        getOAuthToken: async (cb) => cb(accessToken),
        volume: 0.5,
      });
      setAlbumArt(tracks[0].album.images[1].url);
      setPlayer(player);

      player.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
      });

      player.connect();
    };
    // eslint-disable-next-line
  }, [tracks]);

  useEffect(() => {
    if (player) {
      player._options.getOAuthToken = async (cb) => {
        cb(accessToken); // Update the token in the player
      };
    }
    // eslint-disable-next-line
  }, [accessToken]);

  const refreshLibrary = async () => {
    await player.pause();
    setPaused(true);
    setTracksPosition(0);
    setRevealAnswers(false);
    setAwaitingTracks(true);

    const fetchedTracks = await fetchRandomTracks(accessToken, false);
    setTracks(fetchedTracks);
    setPlayerStarted(false);
    setAlbumArt(fetchedTracks[0].album.images[1].url);
    setAwaitingTracks(false);
    return;
  };

  const updateGameState = () => {
    const tempTracksPosition = localStorage.getItem("tracksPosition");
    if (tempTracksPosition) {
      localStorage.setItem(
        "tracksPosition",
        parseInt(tempTracksPosition, 10) + 1
      );
    } else {
      localStorage.setItem("tracksPosition", 0);
    }
    if (score === prevScore) {
      setScore(0);
      localStorage.setItem("1400score", 0);
      localStorage.setItem("5000score", 0);
      localStorage.setItem("10000score", 0);
    } else {
      localStorage.setItem(`${millisecondsPlayed}score`, score);
    }
    setPrevScore(score);
  };

  const nextButtonHandler = async () => {
    if (isCooldown || !isPlayerStarted) return;
    if (!revealAnswers) {
      updateGameState();
    }

    if (tracksPosition === tracks.length - 1) {
      await refreshLibrary();
      return;
    }

    setRevealAnswers(false);
    setCooldown(true);
    setAttempt((prev) => prev + 1);

    const newPosition = tracksPosition + 1;
    setTracksPosition(newPosition);
    playTrack(newPosition);
    setAlbumArt(tracks[newPosition].album.images[1].url);

    setTimeout(() => {
      setCooldown(false);
    }, 3000);
  };

  const playButtonHandler = async () => {
    if (isCooldown) return;
    if (!isPlayerStarted && deviceId) {
      setCooldown(true);
      await transferPlayback();
      await player.activateElement();
      await transferPlayback();
      await player.activateElement();
      setTimeout(async () => {
        await playTrack(tracksPosition);
      }, 1000);
      setTimeout(() => {
        setCooldown(false);
      }, 2000);
      setPaused(false);
    } else if (isPaused && isPlayerStarted) {
      player.resume();
      setPaused(false);
    } else if (isPlayerStarted) {
      player.pause();
      setPaused(true);
    }
  };

  async function transferPlayback() {
    if (!deviceId) {
      console.error("No active device ID available");
      return;
    }

    try {
      const response = await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false, // Set to true if you want playback to start immediately
        }),
      });

      if (!response.ok) {
        console.error("Failed to transfer playback", await response.json());
      }
    } catch (error) {
      console.error("Error transferring playback:", error);
    }
  }

  async function playTrack(position) {
    const positionMs = await (tracks[position].duration_ms >
    startTime + millisecondsPlayed
      ? startTime
      : 0);
    const url = "https://api.spotify.com/v1/me/player/play";
    const body = {
      device_id: deviceId,
      uris: [trackUris[position]],
      position_ms: positionMs,
    };

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setPaused(false);
        setPlayerStarted(true);
        if (millisecondsPlayed === 1400)
          setTimeout(() => {
            setPaused(true);
            player.pause();
            player.seek(startTime);
          }, 1750);
      } else {
        const errorData = await response.json();
        console.error("Error starting track:", errorData);
        window.location.reload();
      }
    } catch (error) {
      console.error("Request failed:", error);
      window.location.reload();
    }
  }

  useEffect(() => {
    if (isPlayerStarted) {
      // Clear the existing interval if it's running
      if (positionCheckIntervalRef.current) {
        clearInterval(positionCheckIntervalRef.current);
        positionCheckIntervalRef.current = null;
      }

      positionCheckIntervalRef.current = setInterval(async () => {
        const state = await player.getCurrentState();
        if (state) {
          const currentPosition = state.position; // Current playback position in ms
          const stopPoint =
            tracks[tracksPosition].duration_ms > startTime + millisecondsPlayed
              ? startTime + millisecondsPlayed
              : millisecondsPlayed;

          if (currentPosition >= stopPoint && !isCooldown) {
            clearInterval(positionCheckIntervalRef.current);
            positionCheckIntervalRef.current = null;

            await player.pause();
            setPaused(true);
            await player.seek(stopPoint - millisecondsPlayed);
          }
        }
      }, 100);
    }

    return () => {
      if (positionCheckIntervalRef.current) {
        clearInterval(positionCheckIntervalRef.current);
        positionCheckIntervalRef.current = null;
      }
    };
  }, [
    isPlayerStarted,
    tracksPosition,
    isCooldown,
    player,
    tracks,
    startTime,
    millisecondsPlayed,
    isPaused,
  ]);

  if (awaitingTracks) {
    return <Loading text={"Refreshing library..."} />;
  } else {
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
              width="220"
              height="220"
              style={{
                borderRadius: "10px",
              }}
            />
          </div>
        )}
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ gap: "7rem" }}
        >
          <PlayButton
            playButtonHandler={playButtonHandler}
            isPaused={isPaused}
          />
          <NextButton
            nextButtonHandler={nextButtonHandler}
            isCooldown={isCooldown}
          />
        </div>
        <div className="d-inline-flex flex-column gap-3 justify-content-center">
          <GuessBox
            placeholder="Artist"
            answer={tracks[tracksPosition].artists}
            revealAnswer={revealAnswers}
            setScore={setScore}
            attempt={attempt}
          />
          <GuessBox
            placeholder="Song"
            answer={tracks[tracksPosition].name}
            revealAnswer={revealAnswers}
            setScore={setScore}
            attempt={attempt}
          />
          <GuessBox
            placeholder="Album"
            answer={tracks[tracksPosition].album.name}
            setShowArt={setShowArt}
            revealAnswer={revealAnswers}
            setScore={setScore}
            attempt={attempt}
          />
        </div>
        <div className="d-inline-flex gap-3 justify-content-center">
          <button
            className="btn btn-dark"
            onClick={() => {
              updateGameState();
              setRevealAnswers(true);
            }}
          >
            Reveal Answers
          </button>

          <button
            className="btn btn-dark"
            onClick={() => {
              setScore(0);
              refreshLibrary();
            }}
          >
            Refresh Library
          </button>
        </div>
      </div>
    );
  }
}

export default Player;
