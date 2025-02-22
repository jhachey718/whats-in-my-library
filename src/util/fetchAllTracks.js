function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function fetchSavedTracks(accessToken, limit) {
  let allTracks = [];
  let offset = 0;

  try {
    while (allTracks.length < limit) {
      const response = await fetch(
        `https://api.spotify.com/v1/me/tracks?limit=50&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      if (!data.items.length) break;

      allTracks.push(...data.items.map((item) => item.track));
      offset += 50;
    }
  } catch (error) {
    console.error("Error fetching liked tracks:", error);
  }

  return allTracks.slice(0, limit); // Ensure we only return up to the requested limit
}

async function fetchUserPlaylists(accessToken, limit) {
  let playlists = [];
  let offset = 0;

  try {
    while (playlists.length < limit) {
      const response = await fetch(
        `https://api.spotify.com/v1/me/playlists?limit=50&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      if (!data.items.length) break;

      playlists.push(...data.items);
      offset += 50;
    }
  } catch (error) {
    console.error("Error fetching playlists:", error);
  }
  const shufflePlaylists = await shuffleArray(playlists);

  return shufflePlaylists;
}

async function fetchPlaylistTracks(accessToken, playlistId, limit) {
  let tracks = [];
  let offset = 0;

  try {
    while (tracks.length < limit) {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      if (!data.items.length) break;

      tracks.push(...data.items.map((item) => item.track));
      offset += 50;
    }
  } catch (error) {
    console.error(`Error fetching tracks for playlist ${playlistId}:`, error);
  }

  return tracks;
}

export async function fetchRandomTracks(accessToken) {
  // const tracksItem = await localStorage.getItem("tracks");
  // if (tracksItem) {
  //   const tracks = JSON.parse(tracksItem);
  //   const isExpired = new Date().getTime() > tracks.expDate;
  //   if (!isExpired) {
  //     const shuffledRetrievedTracks = await shuffleArray(tracks.list);
  //     return shuffledRetrievedTracks.slice(0, 400);
  //   }
  // }
  const trackIds = new Set();
  const uniqueTracks = [];

  // Fetch liked tracks
  const likedTracks = await fetchSavedTracks(accessToken, 100);
  for (const track of likedTracks) {
    if (!trackIds.has(track.id)) {
      trackIds.add(track.id);
      uniqueTracks.push(track);
    }
  }

  // Fetch playlists and their tracks
  const playlists = await fetchUserPlaylists(accessToken, 100);
  for (const playlist of playlists) {
    const playlistTracks = await fetchPlaylistTracks(
      accessToken,
      playlist.id,
      200
    );
    for (const track of playlistTracks) {
      if (!trackIds.has(track.id)) {
        trackIds.add(track.id);
        uniqueTracks.push(track);
      }
    }
    if (uniqueTracks.length >= 1000) break;
  }
  // const date = new Date().setDate(new Date().getDate() + 1);
  // localStorage.setItem(
  //   "tracks",
  //   JSON.stringify({
  //     list: uniqueTracks,
  //     expDate: date,
  //   })
  // );

  // Shuffle and return the first 400 tracks
  const shuffledTracks = shuffleArray(uniqueTracks);
  return shuffledTracks.slice(0, 400);
}
