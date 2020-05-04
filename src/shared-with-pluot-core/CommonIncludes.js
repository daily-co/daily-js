
//
// external - exported from module.js
//

export const DAILY_STATE_NEW = 'new';
export const DAILY_STATE_LOADING = 'loading';
export const DAILY_STATE_LOADED = 'loaded';
export const DAILY_STATE_JOINING = 'joining-meeting';
export const DAILY_STATE_JOINED = 'joined-meeting';
export const DAILY_STATE_LEFT = 'left-meeting';
export const DAILY_STATE_ERROR = 'error';

export const DAILY_EVENT_LOADING = 'loading';
export const DAILY_EVENT_LOADED = 'loaded';
export const DAILY_EVENT_STARTED_CAMERA = 'started-camera';
export const DAILY_EVENT_CAMERA_ERROR = 'camera-error';
export const DAILY_EVENT_JOINING_MEETING = 'joining-meeting';
export const DAILY_EVENT_JOINED_MEETING = 'joined-meeting';
export const DAILY_EVENT_LEFT_MEETING = 'left-meeting';

export const DAILY_EVENT_PARTICIPANT_JOINED = 'participant-joined';
export const DAILY_EVENT_PARTICIPANT_UPDATED = 'participant-updated';
export const DAILY_EVENT_PARTICIPANT_LEFT = 'participant-left';

export const DAILY_EVENT_TRACK_STARTED = 'track-started';
export const DAILY_EVENT_TRACK_STOPPED = 'track-stopped';

export const DAILY_EVENT_RECORDING_STARTED = 'recording-started';
export const DAILY_EVENT_RECORDING_STOPPED = 'recording-stopped';
export const DAILY_EVENT_RECORDING_STATS = 'recording-stats';
export const DAILY_EVENT_RECORDING_ERROR = 'recording-error';
export const DAILY_EVENT_RECORDING_UPLOAD_COMPLETED =
               'recording-upload-completed';
export const DAILY_EVENT_RECORDING_DATA = 'recording-data';
export const DAILY_EVENT_APP_MSG = 'app-message';
export const DAILY_EVENT_INPUT_EVENT = 'input-event';
export const DAILY_EVENT_LOCAL_SCREEN_SHARE_STARTED =
  'local-screen-share-started';
export const DAILY_EVENT_LOCAL_SCREEN_SHARE_STOPPED =
  'local-screen-share-stopped';
export const DAILY_EVENT_ACTIVE_SPEAKER_CHANGE = 'active-speaker-change';
export const DAILY_EVENT_ACTIVE_SPEAKER_MODE_CHANGE = 'active-speaker-mode-change';
export const DAILY_EVENT_NETWORK_QUALITY_CHANGE = 'network-quality-change';
export const DAILY_EVENT_NETWORK_CONNECTION = 'network-connection';

export const DAILY_EVENT_FULLSCREEN = 'fullscreen';
export const DAILY_EVENT_EXIT_FULLSCREEN = 'exited-fullscreen';

export const DAILY_EVENT_ERROR = 'error';

//
// internal
//

export const MAX_APP_MSG_SIZE = 1024 * 4;

export const IFRAME_MESSAGE_MARKER = 'iframe-call-message';

export const DAILY_METHOD_START_CAMERA = 'start-camera';
export const DAILY_METHOD_SET_INPUT_DEVICES = 'set-input-devices';
export const DAILY_METHOD_SET_OUTPUT_DEVICE = 'set-output-device';
export const DAILY_METHOD_GET_INPUT_DEVICES = 'get-input-devices';
export const DAILY_METHOD_JOIN = 'join-meeting';
export const DAILY_METHOD_LEAVE = 'leave-meeting';
export const DAILY_METHOD_UPDATE_PARTICIPANT = 'update-participant';
export const DAILY_METHOD_LOCAL_AUDIO = 'local-audio';
export const DAILY_METHOD_LOCAL_VIDEO = 'local-video';
export const DAILY_METHOD_START_SCREENSHARE = 'local-screen-start';
export const DAILY_METHOD_STOP_SCREENSHARE = 'local-screen-stop';
export const DAILY_METHOD_START_RECORDING = 'local-recording-start';
export const DAILY_METHOD_STOP_RECORDING = 'local-recording-stop';
export const DAILY_METHOD_LOAD_CSS = 'load-css';
export const DAILY_METHOD_SET_BANDWIDTH = 'set-bandwidth';
export const DAILY_METHOD_GET_CALC_STATS = 'get-calc-stats';
export const DAILY_METHOD_ENUMERATE_DEVICES = 'enumerate-devices';
export const DAILY_METHOD_CYCLE_CAMERA = 'cycle-camera';
export const DAILY_METHOD_CYCLE_MIC = 'cycle-mic';
export const DAILY_METHOD_APP_MSG = 'app-msg';
export const DAILY_METHOD_ADD_FAKE_PARTICIPANT = 'add-fake-participant';
export const DAILY_METHOD_SET_SHOW_NAMES = 'set-show-names';
export const DAILY_METHOD_SET_ACTIVE_SPEAKER_MODE = 'set-active-speaker-mode';
export const DAILY_METHOD_REGISTER_INPUT_HANDLER = 'register-input-handler';
export const DAILY_METHOD_SET_LANG = 'set-daily-lang';
export const DAILY_METHOD_DETECT_ALL_FACES = 'detect-all-faces';
export const DAILY_METHOD_ROOM = 'lib-room-info';
export const DAILY_METHOD_SET_NETWORK_TOPOLOGY = 'set-network-topology';
export const DAILY_METHOD_SET_PLAY_DING = 'daily-method-set-play-ding';
export const DAILY_CUSTOM_TRACK = 'daily-custom-track';
export const DAILY_UI_REQUEST_FULLSCREEN = 'request-fullscreen';
export const DAILY_UI_EXIT_FULLSCREEN = 'request-exit-fullscreen';
