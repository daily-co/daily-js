import {
  getLocalIsSubscribedToTrack,
  getLocalTrack,
  getRemoteTrack,
  getLocalCustomTrack,
  getRemoteCustomTrack,
} from './shared-with-pluot-core/selectors';

// Adds tracks to daily-js Participant object.
export function addTracks(p) {
  const state = store.getState();
  for (const type of ['cam', 'screen']) {
    for (const kind of ['video', 'audio']) {
      const key =
        type === 'cam'
          ? kind
          : `screen${kind.charAt(0).toUpperCase() + kind.slice(1)}`;
      const trackInfo = p.tracks[key];
      if (trackInfo) {
        const track = p.local
          ? getLocalTrack(state, type, kind)
          : getRemoteTrack(state, p.session_id, type, kind);
        if (trackInfo.state === 'playable') {
          trackInfo.track = track;
        }
        // Set "persistent" track field where track is present even if not "playable"
        trackInfo.persistentTrack = track;
      }
    }
  }
}

// todo: refactor so that his logic is part of addTracks and friends()
export function addCustomTracks(p) {
  try {
    const state = store.getState();
    for (const trackEntryKey in p.tracks) {
      if (isPredefinedTrack(trackEntryKey)) {
        continue;
      }
      const kind = p.tracks[trackEntryKey].kind;
      if (!kind) {
        console.error('unknown type for custom track');
        continue;
      }
      const trackInfo = p.tracks[trackEntryKey];
      if (trackInfo) {
        const track = p.local
          ? getLocalCustomTrack(state, trackEntryKey, kind)
          : getRemoteCustomTrack(state, p.session_id, trackEntryKey, kind);
        if (trackInfo.state === 'playable') {
          p.tracks[trackEntryKey].track = track;
        }
        trackInfo.persistentTrack = track;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

export function isPredefinedTrack(trackEntryKey) {
  return ['video', 'audio', 'screenVideo', 'screenAudio'].includes(
    trackEntryKey
  );
}

// Adds tracks to daily-js Participant object.
export function addLegacyTracks(p, prevP) {
  let state = store.getState();

  if (p.local) {
    if (p.audio) {
      try {
        p.audioTrack = state.local.streams.cam.stream.getAudioTracks()[0];
        if (!p.audioTrack) {
          p.audio = false;
        }
      } catch (e) {}
    }
    if (p.video) {
      try {
        p.videoTrack = state.local.streams.cam.stream.getVideoTracks()[0];
        if (!p.videoTrack) {
          p.video = false;
        }
      } catch (e) {}
    }
    if (p.screen) {
      try {
        p.screenVideoTrack = state.local.streams.screen.stream.getVideoTracks()[0];
        p.screenAudioTrack = state.local.streams.screen.stream.getAudioTracks()[0];
        if (!(p.screenVideoTrack || p.screenAudioTrack)) {
          p.screen = false;
        }
      } catch (e) {}
    }
    return;
  }

  let connected = true; // default to true to minimize impact of new bugs
  // as of 11/20/2019 when this block of code was
  // first written
  try {
    let sp = state.participants[p.session_id];
    if (
      sp &&
      sp.public &&
      sp.public.rtcType &&
      sp.public.rtcType.impl === 'peer-to-peer'
    ) {
      if (
        sp.private &&
        !['connected', 'completed'].includes(sp.private.peeringState)
      ) {
        connected = false;
      }
    }
  } catch (e) {
    console.error(e);
  }
  if (!connected) {
    p.audio = false;
    p.audioTrack = false;
    p.video = false;
    p.videoTrack = false;
    p.screen = false;
    p.screenTrack = false;
    return;
  }

  try {
    const allStreams = state.streams;

    // find audio track
    if (
      p.audio &&
      getLocalIsSubscribedToTrack(state, p.session_id, 'cam-audio')
    ) {
      const audioTrack = getRemoteTrack(state, p.session_id, 'cam', 'audio');
      if (audioTrack) {
        if (
          prevP &&
          prevP.audioTrack &&
          prevP.audioTrack.id === audioTrack.id
        ) {
          // if we have an apparently identical audio track already in
          // our participant struct leave it in place to avoid flicker
          // during quick muted/unmuted PeerConnection cycles. we'll update
          // audio/video muted at the app level via signaling
          p.audioTrack = audioTrack;
        } else if (!audioTrack.muted) {
          // otherwise, add the found track if it's not muted
          p.audioTrack = audioTrack;
        }
      }
      if (!p.audioTrack) {
        p.audio = false;
      }
    }
    // find video track
    if (
      p.video &&
      getLocalIsSubscribedToTrack(state, p.session_id, 'cam-video')
    ) {
      const videoTrack = getRemoteTrack(state, p.session_id, 'cam', 'video');
      if (videoTrack) {
        if (
          prevP &&
          prevP.videoTrack &&
          prevP.videoTrack.id === videoTrack.id
        ) {
          p.videoTrack = videoTrack;
        } else if (!videoTrack.muted) {
          // otherwise, add the found track if it's not muted
          p.videoTrack = videoTrack;
        }
      }
      if (!p.videoTrack) {
        p.video = false;
      }
    }

    // find screen-share audio track
    if (
      p.screen &&
      getLocalIsSubscribedToTrack(state, p.session_id, 'screen-audio')
    ) {
      const screenAudioTrack = getRemoteTrack(
        state,
        p.session_id,
        'screen',
        'audio'
      );
      if (screenAudioTrack) {
        if (
          prevP &&
          prevP.screenAudioTrack &&
          prevP.screenAudioTrack.id === screenAudioTrack.id
        ) {
          p.screenAudioTrack = screenAudioTrack;
        } else if (!screenAudioTrack.muted) {
          // otherwise, add the found track if it's not muted
          p.screenAudioTrack = screenAudioTrack;
        }
      }
    }
    // find screen-share video track
    if (
      p.screen &&
      getLocalIsSubscribedToTrack(state, p.session_id, 'screen-video')
    ) {
      const screenVideoTrack = getRemoteTrack(
        state,
        p.session_id,
        'screen',
        'video'
      );
      if (screenVideoTrack) {
        if (
          prevP &&
          prevP.screenVideoTrack &&
          prevP.screenVideoTrack.id === screenVideoTrack.id
        ) {
          p.screenVideoTrack = screenVideoTrack;
        } else if (!screenVideoTrack.muted) {
          // otherwise, add the found track if it's not muted
          // note: there is an issue here with timing ... Chrome (and
          // possibly other browsers), gets a video track that's initially
          // not muted, for an audio-only screenshare. The track
          // switches to muted fairly quickly, but we don't have any
          // logic in place to respond to that. todo: fix this so that,
          // at the very least we get a track-stopped event when the
          // "empty" track switches to muted.
          p.screenVideoTrack = screenVideoTrack;
        }
      }
    }
    if (!(p.screenVideoTrack || p.screenAudioTrack)) {
      p.screen = false;
    }
  } catch (e) {
    console.error('unexpected error matching up tracks', e);
  }
}
