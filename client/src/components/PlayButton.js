import React, { useEffect, useState } from "react";

function PlayButton({ accessToken, trackUri }) {
  const [player, setPlayer] = useState(undefined);
  const [deviceId, setDeviceId] = useState(null);
  const [isPaused, setPaused] = useState(true);

  useEffect(() => {
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

      setPlayer(player);

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
            uris: [trackUri],
          }),
        }
      );

      if (response.ok) {
        console.log("Playback started");
      } else {
        console.error("Failed to start playback:", response.statusText);
      }
    } catch (error) {
      console.error("Error starting playback:", error.message);
    }
  };

  return (
    <div className="play-button">
      <button
        onClick={() => {
          if (isPaused) {
            console.log("Resuming playback");
            playTrack();
            setPaused(false);
          } else {
            console.log("Pausing playback");
            player.togglePlay();
            setPaused(true);
          }
        }}
      >
        {isPaused ? "Play" : "Pause"}
      </button>
    </div>
  );
}

export default PlayButton;
