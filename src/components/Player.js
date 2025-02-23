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
  const positionCheckIntervalRef = useRef(null);
  const [prevScore, setPrevScore] = useState(0);
  const [awaitingTracks, setAwaitingTracks] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const startTime = 20000; //in milliseconds

  useEffect(() => {
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
    await player.setVolume(0.0).then(() => {
      player.nextTrack();
    });

    const newPosition = tracksPosition + 1;
    setTracksPosition(newPosition);
    setAlbumArt(tracks[newPosition].album.images[1].url);

    setTimeout(async () => {
      if (tracks[newPosition].duration_ms > startTime + millisecondsPlayed) {
        await player.pause().then(() => {
          player.seek(startTime);
        });
      }

      setPaused(false);
    }, 1200);
    setTimeout(async () => {
      await player.setVolume(0.5).then(() => {
        player.resume();
      });
    }, 1700);

    // Disable cooldown after 3 seconds
    setTimeout(() => {
      setCooldown(false);
    }, 3000);
  };

  const playButtonHandler = async () => {
    if (!isPlayerStarted && deviceId) {
      await playTrack();
      await player.activateElement();
      setPaused(false);
    } else if (isPaused) {
      player.togglePlay();
      setPaused(false);
    } else if (isPlayerStarted) {
      player.togglePlay();
      setPaused(true);
    }
  };

  const playTrack = async () => {
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
        player.addListener("player_state_changed", (state) => {
          if (
            state &&
            !state.paused &&
            state.position === 0 &&
            tracks[tracksPosition].duration_ms > startTime + millisecondsPlayed
          ) {
            setTimeout(() => {
              player
                .seek(startTime)
                .catch((err) => console.error("Error seeking:", err));
            }, 500);
          }

          setPlayerStarted(true);
        });
      } else {
        console.error("Failed to start playback:", response.statusText);
      }
    } catch (error) {
      console.error("Error starting playback:", error.message);
    }
  };

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
            // answer={tracks[tracksPosition].artists}
            answer="test"
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
            // answer={tracks[tracksPosition].album.name}
            answer="test"
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
