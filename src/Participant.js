import { getLocalIsSubscribedToTrack } from './shared-with-pluot-core/selectors';
import filter from 'lodash/filter';
import orderBy from 'lodash/orderBy';

// Adds tracks to daily-js Participant object.
export function addTracks(p, prevP) {
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
      // TODO: update to use getRemoteTrack selector
      let audioTracks = orderBy(
        filter(
          allStreams,
          (s) =>
            s.participantId === p.session_id &&
            s.type === 'cam' &&
            s.pendingTrack &&
            s.pendingTrack.kind === 'audio'
        ),
        'starttime',
        'desc'
      );
      if (audioTracks && audioTracks[0] && audioTracks[0].pendingTrack) {
        if (
          prevP &&
          prevP.audioTrack &&
          prevP.audioTrack.id === audioTracks[0].pendingTrack.id
        ) {
          // if we have an apparently identical audio track already in
          // our participant struct leave it in place to avoid flicker
          // during quick muted/unmuted PeerConnection cycles. we'll update
          // audio/video muted at the app level via signaling
          p.audioTrack = audioTracks[0].pendingTrack;
        } else if (!audioTracks[0].pendingTrack.muted) {
          // otherwise, add the found track if it's not muted
          p.audioTrack = audioTracks[0].pendingTrack;
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
      let videoTracks = orderBy(
        filter(
          allStreams,
          (s) =>
            s.participantId === p.session_id &&
            s.type === 'cam' &&
            s.pendingTrack &&
            s.pendingTrack.kind === 'video'
        ),
        'starttime',
        'desc'
      );
      if (videoTracks && videoTracks[0] && videoTracks[0].pendingTrack) {
        if (
          prevP &&
          prevP.videoTrack &&
          prevP.videoTrack.id === videoTracks[0].pendingTrack.id
        ) {
          p.videoTrack = videoTracks[0].pendingTrack;
        } else if (!videoTracks[0].pendingTrack.muted) {
          // otherwise, add the found track if it's not muted
          p.videoTrack = videoTracks[0].pendingTrack;
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
      let screenAudioTracks = orderBy(
        filter(
          allStreams,
          (s) =>
            s.participantId === p.session_id &&
            s.type === 'screen' &&
            s.pendingTrack &&
            s.pendingTrack.kind === 'audio'
        ),
        'starttime',
        'desc'
      );
      if (
        screenAudioTracks &&
        screenAudioTracks[0] &&
        screenAudioTracks[0].pendingTrack
      ) {
        if (
          prevP &&
          prevP.screenAudioTrack &&
          prevP.screenAudioTrack.id === screenAudioTracks[0].pendingTrack.id
        ) {
          p.screenAudioTrack = screenAudioTracks[0].pendingTrack;
        } else if (!screenAudioTracks[0].pendingTrack.muted) {
          // otherwise, add the found track if it's not muted
          p.screenAudioTrack = screenAudioTracks[0].pendingTrack;
        }
      }
    }
    // find screen-share video track
    if (
      p.screen &&
      getLocalIsSubscribedToTrack(state, p.session_id, 'screen-video')
    ) {
      let screenVideoTracks = orderBy(
        filter(
          allStreams,
          (s) =>
            s.participantId === p.session_id &&
            s.type === 'screen' &&
            s.pendingTrack &&
            s.pendingTrack.kind === 'video'
        ),
        'starttime',
        'desc'
      );
      if (
        screenVideoTracks &&
        screenVideoTracks[0] &&
        screenVideoTracks[0].pendingTrack
      ) {
        if (
          prevP &&
          prevP.screenVideoTrack &&
          prevP.screenVideoTrack.id === screenVideoTracks[0].pendingTrack.id
        ) {
          p.screenVideoTrack = screenVideoTracks[0].pendingTrack;
        } else if (!screenVideoTracks[0].pendingTrack.muted) {
          // otherwise, add the found track if it's not muted
          // note: there is an issue here with timing ... Chrome (and
          // possibly other browsers), gets a video track that's initially
          // not muted, for an audio-only screenshare. The track
          // switches to muted fairly quickly, but we don't have any
          // logic in place to respond to that. todo: fix this so that,
          // at the very least we get a track-stopped event when the
          // "empty" track switches to muted.
          p.screenVideoTrack = screenVideoTracks[0].pendingTrack;
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
