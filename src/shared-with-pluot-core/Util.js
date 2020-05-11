export const getParticipantIsSubscribedToTrack = (state, id, mediaTag) => {
  return _getIsSubscribedToTrack(state,
                                 state.participants[id],
                                 state.local.public.id,
                                 mediaTag);
}

export const getLocalIsSubscribedToTrack = (state, id, mediaTag) => {
  return _getIsSubscribedToTrack(state,
                                 state.local,
                                 id,
                                 mediaTag);
}

export const _getIsSubscribedToTrack = (state, p, p2id, mediaTag) => {
  // if we don't have a participant record at all, assume that 
  // true is the safest thing to return, here
  if (!p) {
    return false;
  }
  if (!p.public.subscribedTracks ||   // sanity check
      p.public.subscribedTracks.ALL) {
    return true;
  }
  return p.public.subscribedTracks[p2id] &&
         p.public.subscribedTracks[p2id][mediaTag];
}
