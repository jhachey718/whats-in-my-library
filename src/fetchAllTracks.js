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

  return playlists;
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
  let likedTracks = await fetchSavedTracks(accessToken, 100);
  let playlists = await fetchUserPlaylists(accessToken, 100);
  playlists = await shuffleArray(playlists);
  let allPlaylistTracks = [];

  for (const playlist of playlists) {
    const playlistTracks = await fetchPlaylistTracks(
      accessToken,
      playlist.id,
      100
    );
    allPlaylistTracks.push(...playlistTracks);
    if (allPlaylistTracks.length >= 400) break;
  }
  console.log(allPlaylistTracks);

  // Combine liked tracks and playlist tracks
  let allTracks = [...allPlaylistTracks, ...likedTracks];

  // Shuffle the combined list of all tracks
  allTracks = shuffleArray(allTracks);

  // Return only the first 300 tracks
  return allTracks.slice(0, 300);
}
