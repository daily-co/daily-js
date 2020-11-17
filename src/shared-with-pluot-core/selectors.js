import filter from 'lodash/filter';
import orderBy from 'lodash/orderBy';

export const getParticipantIsSubscribedToTrack = (state, id, mediaTag) => {
  return _getIsSubscribedToTrack(
    state.participants[id],
    state.local.public.id,
    mediaTag
  );
};

export const getLocalIsSubscribedToTrack = (state, id, mediaTag) => {
  return _getIsSubscribedToTrack(state.local, id, mediaTag);
};

export const _getIsSubscribedToTrack = (p, p2id, mediaTag) => {
  // if we don't have a participant record at all, assume that
  // false is the safest thing to return, here
  if (!p) {
    return false;
  }
  if (
    !p.public.subscribedTracks || // sanity check
    p.public.subscribedTracks.ALL
  ) {
    return true;
  }
  if (!p.public.subscribedTracks[p2id]) {
    // this shouldn't happen, so return false for safety, as above
    return false;
  }
  if (p.public.subscribedTracks[p2id].ALL !== undefined) {
    return p.public.subscribedTracks[p2id].ALL;
  }
  return p.public.subscribedTracks[p2id][mediaTag];
};

// type is "cam" or "screen"
// kind is "video" or "audio"
export const getLocalTrack = (state, type, kind) => {
  return (
    state.local.streams &&
    state.local.streams[type] &&
    state.local.streams[type].stream &&
    state.local.streams[type].stream[
      `get${kind === 'video' ? 'Video' : 'Audio'}Tracks`
    ]()[0]
  );
};

// type is "cam" or "screen"
// kind is "video" or "audio"
export const getRemoteTrack = (state, participantId, type, kind) => {
  let tracks = orderBy(
    filter(
      state.streams,
      (s) =>
        s.participantId === participantId &&
        s.type === type &&
        s.pendingTrack &&
        s.pendingTrack.kind === kind
    ),
    'starttime',
    'desc'
  );
  return tracks && tracks[0] && tracks[0].pendingTrack;
};
