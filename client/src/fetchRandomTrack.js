export default function fethRandomTrack(tracks) {
  return tracks[Math.floor(Math.random() * tracks.length)];
}
