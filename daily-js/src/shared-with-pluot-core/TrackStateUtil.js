export function isPlayable(track) {
  return track && track.readyState === 'live' && !track.muted;
}
