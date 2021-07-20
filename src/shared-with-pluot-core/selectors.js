import filter from 'lodash/filter';
import orderBy from 'lodash/orderBy';

export const getLocalSubscriptionToTrack = (state, id, mediaTag) => {
  return _getSubscriptionToTrack(state.local, id, mediaTag);
};

export const getLocalIsSubscribedToTrack = (state, id, mediaTag) => {
  return _getSubscriptionToTrack(state.local, id, mediaTag) === true;
};

// NOTE: only meant for use in P2P mode, where we have access to remote
// participants' subscriptions info.
export const getRemoteParticipantIsSubscribedToLocalTrack = (
  state,
  id,
  mediaTag
) => {
  return (
    _getSubscriptionToTrack(
      state.participants[id],
      state.local.public.id,
      mediaTag
    ) === true
  );
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

// kind is "video" or "audio"
// for standard tracks, type is "cam" or "screen"
// for custom tracks, type is the mediaTag
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
    } else if (type === 'screen') {
      return !loadedTracks[
        `screen${kind.charAt(0).toUpperCase() + kind.slice(1)}`
      ];
    } else {
      return !loadedTracks[type];
    }
  }
  return false;
};

// NOTE: maps 'avatar' to true. 'avatar' is deprecated with the new prebuilt ui
// and is currently accessed directly from redux anyway (not via this selector)
// where it's needed.
const _getSubscriptionToTrack = (subscriber, subscribeeId, mediaTag) => {
  // if we don't have a participant record at all, assume that
  // false is the safest thing to return, here
  if (!subscriber) {
    return false;
  }
  const mapToTrueFalseStaged = (subscription) => {
    switch (subscription) {
      case 'avatar':
        return true;
      case 'staged':
        return subscription;
      default:
        // boolean or undefined
        return !!subscription;
    }
  };
  const sTracks = subscriber.public.subscribedTracks;
  // Below shows the return values for all the various versions of sTracks
  //   { ALL: true }                   -> true
  //   { ALL: false }                  -> false
  //   { ALL: 'staged' }               -> 'staged'
  //   { ALL: 'avatar' }               -> true
  //   undefined                       -> true  // this should never happen
  //   {},                             -> false
  //   { p2id: { }}                    -> false
  //   { p2id: { mediaTag: true }}     -> true
  //   { p2id: { mediaTag: false }}    -> false
  //   { p2id: { mediaTag: 'staged' }} -> 'staged'
  //   { p2id: { mediaTag: 'avatar' }} -> true
  if (!(sTracks && sTracks[subscribeeId])) {
    return sTracks ? mapToTrueFalseStaged(sTracks.ALL) : true;
  }

  return mapToTrueFalseStaged(sTracks[subscribeeId][mediaTag]);
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

export const getLocalCustomTrack = (state, trackEntryKey) => {
  const trackEntries = state.local.public.customTracks;
  if (!(trackEntries && trackEntries[trackEntryKey])) {
    return;
  }
  return trackEntries[trackEntryKey].track;
};

export const getRemoteCustomTrack = (state, participantId, mediaTag, kind) => {
  // for now, we only support sfu mode for custom tracks. the streamId is always
  // prepended with "soup-" sfu-mode tracks. ("streamId" is a very old name that
  // dates from the era of transitional support for tracks, rather than streams,
  // in the WebRTC spec.)
  const streamId = 'soup-' + mediaTag;
  let streams = orderBy(
    filter(
      state.streams,
      (s) =>
        s.participantId === participantId &&
        s.streamId === streamId &&
        s.pendingTrack &&
        s.pendingTrack.kind === kind
    ),
    'starttime',
    'desc'
  );
  return streams && streams[0] && streams[0].pendingTrack;
};
