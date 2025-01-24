import React, { useEffect, useState } from "react";

function PlayButton({ accessToken, tracks, showArt }) {
  const [player, setPlayer] = useState(undefined);
  const [deviceId, setDeviceId] = useState(null);
  const [isPaused, setPaused] = useState(true);
  const [isPlayerStarted, setPlayerStarted] = useState(false);
  const [trackUris, setTrackUris] = useState([]);
  const [albumArt, setAlbumArt] = useState("");
  const [tracksPosition, setTracksPositon] = useState(0);

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
          if (state && !state.paused) {
            // Track is playing, now seek
            console.log(tracks[tracksPosition].duration_ms / 2);
            player
              .seek(Number(tracks[tracksPosition].duration_ms / 2))
              .then(() => {
                console.log("Seeked to halfway point");
              });

            // Optionally, remove the listener after seeking
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

  return (
    <div className="play-button">
      {albumArt && showArt && (
        <img src={albumArt} alt="Album Art" width="200" height="200" />
      )}
      <button
        onClick={() => {
          if (!isPlayerStarted) {
            console.log("Starting playback");
            playTrack();
            setPlayerStarted(true);
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
      >
        {isPaused ? "Play" : "Pause"}
      </button>
      <button
        onClick={() => {
          player.nextTrack();
          setTracksPositon((prev) => prev + 1);
          console.log(tracksPosition);
          setAlbumArt(tracks[tracksPosition].album.images[1].url);
        }}
      >
        Next
      </button>
    </div>
  );
}

export default PlayButton;
