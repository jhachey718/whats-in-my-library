async function fetchSavedTracks(accessToken, offset, limit) {
  const response = await fetch(
    `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await response.json();
  return data.items;
}
export async function fetchAllTracks(accessToken) {
  let allTracks = [];
  let offset = 0;
  const limit = 50;
  try {
    while (true) {
      const tracks = await fetchSavedTracks(accessToken, offset, limit);
      if (tracks.length === 0) break;

      allTracks = allTracks.concat(tracks);
      offset += limit;
    }

    return allTracks;
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return [];
  }
}
