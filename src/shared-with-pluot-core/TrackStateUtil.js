import { getBrowserName } from './Environment';

// Returns whether `track` is `muted`.
// Assumes that `track` exists.
function isTrackMuted(track, { isLocalScreenVideo }) {
  // In Chromium, local screen share tracks become `muted` whenever their
  // content is not changing (e.g. when you're not scrolling). This really
  // messes with our ability to determine whether the track is *actually* muted,
  // so here we simply treat them as not `muted` (the overwhelmingly likely
  // scenario).
  if (isLocalScreenVideo && getBrowserName() === 'Chrome') {
    return false;
  }

  return track.muted;
}

export function isPlayable(track, { isLocalScreenVideo }) {
  return (
    track &&
    track.readyState === 'live' &&
    !isTrackMuted(track, { isLocalScreenVideo })
  );
}
