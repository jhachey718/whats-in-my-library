import LZString from "lz-string";
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

  // Make sure data is returned in expected format
  const tracksWithAlbumInfo = albums.flatMap((albumItem) =>
    albumItem.album.tracks.items.map((track) => ({
      ...track,
      album: {
        name: albumItem.album.name,
        images: ["", albumItem.album.images[1]],
      },
    }))
  );

  return shuffleArray(tracksWithAlbumInfo);
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

export async function fetchRandomTracks(accessToken, fromLocal) {
  if (fromLocal) {
    const tracksItem = await localStorage.getItem("tracks");
    if (tracksItem) {
      const tracks = JSON.parse(LZString.decompress(tracksItem));
      const tracksPosition = await localStorage.getItem("tracksPosition");
      if (tracksPosition) {
        const position = parseInt(tracksPosition, 10);
        return tracks.list.slice(position, tracks.list.length - 1);
      } else {
        localStorage.setItem("tracksPosition", 0);
        const shuffledRetrievedTracks = await shuffleArray(tracks.list);
        localStorage.setItem(
          "tracks",
          LZString.compress(
            JSON.stringify({
              list: shuffledRetrievedTracks,
            })
          )
        );
        return shuffledRetrievedTracks;
      }
    }
  }
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
  let numberOfPlaylistTracks = 0;
  for (const playlist of playlists) {
    numberOfPlaylistTracks = Math.floor(Math.random() * (150 - 30) + 30);
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

  const shuffledTracks = await shuffleArray(uniqueTracks);
  localStorage.setItem(
    "tracks",
    LZString.compress(
      JSON.stringify({
        list: shuffledTracks,
      })
    )
  );
  localStorage.setItem("tracksPosition", 0);
  return shuffledTracks;
}
