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
  const streamEntry = _getRemoteStreamEntry(state, participantId, type, kind);
  return streamEntry && streamEntry.pendingTrack;
};

// type is "cam" or "screen"
// kind is "video" or "audio"
export const getIsRemoteTrackLoading = (state, participantId, type, kind) => {
  const participant = state.participants && state.participants[participantId];
  const loadedTracks =
    participant && participant.public && participant.public.loadedTracks;
  if (loadedTracks) {
    if (type === 'cam') {
      return !loadedTracks[kind];
    } else {
      return !loadedTracks[
        `screen${kind.charAt(0).toUpperCase() + kind.slice(1)}`
      ];
    }
  }
  return false;
};

const _getIsSubscribedToTrack = (p, p2id, mediaTag) => {
  // if we don't have a participant record at all, assume that
  // false is the safest thing to return, here
  if (!p) {
    return false;
  }
  const sTracks = p.public.subscribedTracks;
  // Below shows the return values for all the various versions of sTracks
  //   { ALL: true }                -> true
  //   { ALL: false }               -> false
  //   undefined                    -> true  // this should never happen
  //   {},                          -> false
  //   { p2id: { }}                 -> false
  //   { p2id: { mediaTag: true }}  -> true
  //   { p2id: { mediaTag: false }} -> false
  if (!(sTracks && sTracks[p2id])) {
    return sTracks ? !!sTracks.ALL : true;
  }

  return !!sTracks[p2id][mediaTag];
};

const _getRemoteStreamEntry = (state, participantId, type, kind) => {
  let streams = orderBy(
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
  return streams && streams[0];
};
