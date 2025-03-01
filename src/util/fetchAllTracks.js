import LZString from "lz-string";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function fetchSavedTracks(accessToken, limit) {
  let savedTracks = [];
  let offset = 0;

  try {
    while (savedTracks.length < limit) {
      const response = await fetch(
        `https://api.spotify.com/v1/me/tracks?limit=50&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      if (!data.items.length) break;

      savedTracks.push(
        ...data.items.map(({ track }) => ({
          name: track.name,
          id: track.id,
          uri: track.uri, // Added URI field
          album: {
            name: track.album.name,
            images: track.album.images,
          },
          artists: track.artists.map((artist) => ({ name: artist.name })),
          duration_ms: track.duration_ms,
        }))
      );
      offset += 50;
    }
  } catch (error) {
    console.error("Error fetching liked tracks:", error);
  }

  return shuffleArray(savedTracks).slice(0, 100);
}

async function fetchUserAlbums(accessToken, limit) {
  let albums = [];
  let offset = 0;

  try {
    while (albums.length < limit) {
      const response = await fetch(
        `https://api.spotify.com/v1/me/albums?limit=50&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      if (!data.items.length) break;

      albums.push(...data.items);
      offset += 50;
    }
  } catch (error) {
    console.error("Error fetching albums:", error);
  }

  return shuffleArray(
    albums.flatMap((albumItem) =>
      albumItem.album.tracks.items.map((track) => ({
        name: track.name,
        id: track.id,
        uri: track.uri, // Added URI field
        album: {
          name: albumItem.album.name,
          images: albumItem.album.images,
        },
        artists: track.artists.map((artist) => ({ name: artist.name })),
        duration_ms: track.duration_ms,
      }))
    )
  );
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

  return shuffleArray(playlists);
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

      tracks.push(
        ...data.items.map(({ track }) => ({
          name: track.name,
          id: track.id,
          uri: track.uri, // Added URI field
          album: {
            name: track.album.name,
            images: track.album.images,
          },
          artists: track.artists.map((artist) => ({ name: artist.name })),
          duration_ms: track.duration_ms,
        }))
      );
      offset += 50;
    }
  } catch (error) {
    console.error(`Error fetching tracks for playlist ${playlistId}:`, error);
  }

  return tracks;
}

export async function fetchRandomTracks(accessToken, fromLocal) {
  if (fromLocal) {
    const tracksItem = localStorage.getItem("tracks");
    if (tracksItem) {
      const tracks = JSON.parse(LZString.decompress(tracksItem));
      const tracksPosition = localStorage.getItem("tracksPosition");
      if (tracksPosition) {
        const position = parseInt(tracksPosition, 10);
        return tracks.list.slice(position);
      } else {
        localStorage.setItem("tracksPosition", 0);
        const shuffledTracks = shuffleArray(tracks.list);
        localStorage.setItem(
          "tracks",
          LZString.compress(JSON.stringify({ list: shuffledTracks }))
        );
        return shuffledTracks;
      }
    }
  }

  const trackIds = new Set();
  const uniqueTracks = [];

  // Fetch liked tracks
  const likedTracks = await fetchSavedTracks(accessToken, 300);
  for (const track of likedTracks) {
    if (!trackIds.has(track.id)) {
      trackIds.add(track.id);
      uniqueTracks.push(track);
    }
  }

  // Fetch album tracks
  const albumTracks = await fetchUserAlbums(accessToken, 50);
  for (const track of albumTracks) {
    if (!trackIds.has(track.id)) {
      trackIds.add(track.id);
      uniqueTracks.push(track);
    }
    if (uniqueTracks.length >= 500) break;
  }

  // Fetch playlists and their tracks
  const playlists = await fetchUserPlaylists(accessToken, 100);
  for (const playlist of playlists) {
    const numberOfPlaylistTracks = Math.floor(Math.random() * (150 - 30) + 30);
    const playlistTracks = await fetchPlaylistTracks(
      accessToken,
      playlist.id,
      numberOfPlaylistTracks
    );
    for (const track of playlistTracks) {
      if (!trackIds.has(track.id)) {
        trackIds.add(track.id);
        uniqueTracks.push(track);
      }
    }
    if (uniqueTracks.length >= 700) break;
  }

  const shuffledTracks = shuffleArray(uniqueTracks);
  localStorage.setItem(
    "tracks",
    LZString.compress(JSON.stringify({ list: shuffledTracks }))
  );
  localStorage.setItem("tracksPosition", 0);
  return shuffledTracks;
}
