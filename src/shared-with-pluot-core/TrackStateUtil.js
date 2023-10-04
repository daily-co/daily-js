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

// Only for use with v2CamAndMic (should be renamed when v1 cam and mic code
// path is removed).
// Assumes track is non-null/undefined.
export function getTrackDeviceId_v2CAM(track) {
  return track.isProcessed
    ? track._deviceId // undefined if base track is custom (i.e. not Daily-managed)
    : track._treatAsDefaultDevice
    ? 'default'
    : track.getSettings?.().deviceId;
}

// Only for use with v2CamAndMic (should be renamed when v1 cam and mic code
// path is removed).
// Assumes track is non-null/undefined.
export function getTrackDeviceLabel_v2CAM(track) {
  return track.isProcessed
    ? track._label // undefined if base track is custom (i.e. not Daily-managed)
    : track._treatAsDefaultDevice
    ? track._defaultDeviceLabel
    : track.label;
}
