import React, { useEffect, useState } from "react";

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

  const nextButtonHandler = () => {
    if (isCooldown) return;

    setCooldown(true);
    setTimeout(() => {
      setCooldown(false);
    }, 2000);
    player.setVolume(0);
    player.nextTrack();
    setPaused(true);
    setTracksPositon((prev) => {
      const newPosition = prev + 1;
      setAlbumArt(tracks[newPosition].album.images[1].url);
      setTimeout(() => {
        player.seek(Number(tracks[newPosition].duration_ms / 2));
        player.pause();
        player.setVolume(0.5);
      }, 500);
      return newPosition;
    });
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
        console.log(`Current position: ${currentPosition}ms`);

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
    <div className="play-button">
      {albumArt && (
        <img
          src={showArt ? albumArt : "/default-cover-art.png"}
          alt="Album Art"
          width="200"
          height="200"
        />
      )}
      <button
        onClick={() => {
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
        }}
        style={{
          border: "none",
          backgroundColor: "transparent",
        }}
      >
        <img
          src={isPaused ? "/play_button.png" : "/pause_button.png"}
          alt="Play/Pause Button"
          height="100"
          width="100"
        />
      </button>

      {
        // Add cooldown to button
      }
      <button onClick={nextButtonHandler} disabled={isCooldown}>
        Next
      </button>
    </div>
  );
}

export default PlayButton;
