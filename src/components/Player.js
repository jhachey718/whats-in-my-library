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
  const startTime = 20000; //in milliseconds

  useEffect(() => {
    setScore(0);
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

  const nextButtonHandler = async () => {
    if (isCooldown || !isPlayerStarted) return;
    if (score === prevScore) {
      setScore(0);
    }
    setPrevScore(score);
    if (tracksPosition === tracks.length - 1) {
      await player.pause();
      await setPaused(true);
      await setTracksPosition(0);
      await setRevealAnswers(false);
      await setAwaitingTracks(true);
      const fetchedTracks = await fetchRandomTracks(accessToken);
      await setTracks(fetchedTracks);
      await setPlayerStarted(false);
      await setAlbumArt(fetchedTracks[0].album.images[1].url);
      await setAwaitingTracks(false);
      return;
    }
    setRevealAnswers(false);
    setCooldown(true);
    setTimeout(() => {
      setCooldown(false);
    }, 3000);
    await player.pause();
    await player.setVolume(0.0);
    await player.nextTrack();
    setPaused(false);
    setTracksPosition((prev) => {
      const newPosition = prev + 1;
      setAlbumArt(tracks[newPosition].album.images[1].url);
      setTimeout(async () => {
        if (tracks[newPosition].duration_ms > startTime + millisecondsPlayed) {
          await player.seek(startTime);
        }
        await player.setVolume(0.5);
        await player.resume();
      }, 500);
      if (millisecondsPlayed === 1000) {
        setTimeout(async () => {
          setPaused(true);
          await player.pause();
          if (
            tracks[newPosition].duration_ms >
            startTime + millisecondsPlayed
          ) {
            await player.seek(startTime);
          } else {
            await player.seek(0);
          }
        }, millisecondsPlayed + 900);
      }
      return newPosition;
    });
  };

  const playButtonHandler = () => {
    if (!isPlayerStarted) {
      playTrack();
      setPaused(false);
    } else if (isPaused) {
      player.togglePlay();
      setPaused(false);
    } else {
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
          setTimeout(() => {
            player.resume();
          }, 500);

          player.removeListener("player_state_changed");
        });
      } else {
        console.error("Failed to start playback:", response.statusText);
      }
    } catch (error) {
      console.error("Error starting playback:", error.message);
    }
  };

  if (isPlayerStarted) {
    if (positionCheckIntervalRef.current) {
      clearInterval(positionCheckIntervalRef.current);
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
          clearInterval(positionCheckIntervalRef.current); // Stop the interval
          positionCheckIntervalRef.current = null; // Reset reference
          player.pause().then(() => {
            setPaused(true);
            player.seek(stopPoint - millisecondsPlayed);
          });
        }
      }
    }, 500);
  }
  if (awaitingTracks) {
    return <Loading text={"Finding more songs..."} />;
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
              width="200"
              height="200"
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
          />
          <GuessBox
            placeholder="Song"
            answer={tracks[tracksPosition].name}
            revealAnswer={revealAnswers}
            setScore={setScore}
          />
          <GuessBox
            placeholder="Album"
            answer={tracks[tracksPosition].album.name}
            setShowArt={setShowArt}
            revealAnswer={revealAnswers}
            setScore={setScore}
          />
        </div>
        <div className="d-inline-flex justify-content-center">
          <button
            className="btn btn-dark"
            onClick={() => setRevealAnswers(true)}
          >
            Reveal Answers
          </button>
        </div>
      </div>
    );
  }
}

export default Player;
