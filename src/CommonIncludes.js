
//
// external - exported from module.js
//

export const DAILY_STATE_NEW = 'new';
export const DAILY_STATE_JOINING = 'joining-meeting';
export const DAILY_STATE_JOINED = 'joined-meeting';
export const DAILY_STATE_LEFT = 'left-meeting';
export const DAILY_STATE_ERROR = 'error';


export const DAILY_EVENT_JOINING_MEETING = 'joining-meeting';
export const DAILY_EVENT_JOINED_MEETING = 'joined-meeting';
export const DAILY_EVENT_LEFT_MEETING = 'left-meeting';

export const DAILY_EVENT_PARTICIPANT_JOINED = 'participant-joined';
export const DAILY_EVENT_PARTICIPANT_UPDATED = 'participant-updated';
export const DAILY_EVENT_PARTICIPANT_LEFT = 'participant-left';

export const DAILY_EVENT_RECORDING_STARTED = 'recording-started';
export const DAILY_EVENT_RECORDING_STOPPED = 'recording-stopped';
export const DAILY_EVENT_RECORDING_STATS = 'recording-stats';
export const DAILY_EVENT_RECORDING_ERROR = 'recording-error';
export const DAILY_EVENT_RECORDING_UPLOAD_COMPLETED =
               'recording-upload-completed';


export const DAILY_EVENT_ERROR = 'error';

//
// internal
//

export const IFRAME_MESSAGE_MARKER = 'iframe-call-message';

export const DAILY_METHOD_LEAVE = 'leave-meeting';
export const DAILY_METHOD_UPDATE_PARTICIPANT = 'update-participant';
export const DAILY_METHOD_LOCAL_AUDIO = 'local-audio';
export const DAILY_METHOD_LOCAL_VIDEO = 'local-video';
export const DAILY_METHOD_START_SCREENSHARE = 'local-screen-start';
export const DAILY_METHOD_STOP_SCREENSHARE = 'local-screen-stop';
export const DAILY_METHOD_START_RECORDING = 'local-recording-start';
export const DAILY_METHOD_STOP_RECORDING = 'local-recording-stop';
export const DAILY_METHOD_LOAD_CSS = 'load-css';
