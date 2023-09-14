import { getBrowserName } from './Environment';

// remote tracks oftentimes toggle between muted/unmuted in quick succession.
// For this reason, we don't actually consider a track muted until it has been
// so for 3 seconds. During this period, the track is added to the
// maybeTransientMutedTracks list below so that we can ignore and treat them
// as not muted in `isTrackMuted()`.
// Note:  We can't use this same approach for the local screenshare because we
// don't have a mute handler attached but mainly because they remain muted but
// valid for long periods of as long as they are static.
export let maybeTransientMutedTracks = new Set();

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

  return track.muted && !maybeTransientMutedTracks.has(track.id);
}

export function isPlayable(track, { isLocalScreenVideo }) {
  return (
    track &&
    track.readyState === 'live' &&
    !isTrackMuted(track, { isLocalScreenVideo })
  );
}
