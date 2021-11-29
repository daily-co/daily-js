//
// external - exported from module.js
//

// meeting states

export const DAILY_STATE_NEW = 'new';
export const DAILY_STATE_LOADING = 'loading';
export const DAILY_STATE_LOADED = 'loaded';
export const DAILY_STATE_JOINING = 'joining-meeting';
export const DAILY_STATE_JOINED = 'joined-meeting';
export const DAILY_STATE_LEFT = 'left-meeting';
export const DAILY_STATE_ERROR = 'error';

// track states

export const DAILY_TRACK_STATE_BLOCKED = 'blocked';
export const DAILY_TRACK_STATE_OFF = 'off';
export const DAILY_TRACK_STATE_SENDABLE = 'sendable';
export const DAILY_TRACK_STATE_LOADING = 'loading';
export const DAILY_TRACK_STATE_INTERRUPTED = 'interrupted';
export const DAILY_TRACK_STATE_PLAYABLE = 'playable';

// meeting access

export const DAILY_ACCESS_UNKNOWN = 'unknown';
export const DAILY_ACCESS_LEVEL_FULL = 'full';
export const DAILY_ACCESS_LEVEL_LOBBY = 'lobby';
export const DAILY_ACCESS_LEVEL_NONE = 'none';

// receive settings

export const DAILY_RECEIVE_SETTINGS_BASE_KEY = 'base';
export const DAILY_RECEIVE_SETTINGS_ALL_PARTICIPANTS_KEY = '*';

// error types

export const DAILY_FATAL_ERROR_EJECTED = 'ejected';
export const DAILY_FATAL_ERROR_NBF_ROOM = 'nbf-room';
export const DAILY_FATAL_ERROR_NBF_TOKEN = 'nbf-token';
export const DAILY_FATAL_ERROR_EXP_ROOM = 'exp-room';
export const DAILY_FATAL_ERROR_EXP_TOKEN = 'exp-token';

export const DAILY_CAMERA_ERROR_CAM_IN_USE = 'cam-in-use';
export const DAILY_CAMERA_ERROR_MIC_IN_USE = 'mic-in-use';
export const DAILY_CAMERA_ERROR_CAM_AND_MIC_IN_USE = 'cam-mic-in-use';

// events

export const DAILY_EVENT_IFRAME_READY_FOR_LAUNCH_CONFIG =
  'iframe-ready-for-launch-config';
export const DAILY_EVENT_IFRAME_LAUNCH_CONFIG = 'iframe-launch-config';
export const DAILY_EVENT_THEME_UPDATED = 'theme-updated';
export const DAILY_EVENT_LOADING = 'loading';
export const DAILY_EVENT_LOAD_ATTEMPT_FAILED = 'load-attempt-failed';
export const DAILY_EVENT_LOADED = 'loaded';
export const DAILY_EVENT_STARTED_CAMERA = 'started-camera';
export const DAILY_EVENT_CAMERA_ERROR = 'camera-error';
export const DAILY_EVENT_JOINING_MEETING = 'joining-meeting';
export const DAILY_EVENT_JOINED_MEETING = 'joined-meeting';
export const DAILY_EVENT_LEFT_MEETING = 'left-meeting';

export const DAILY_EVENT_PARTICIPANT_JOINED = 'participant-joined';
export const DAILY_EVENT_PARTICIPANT_UPDATED = 'participant-updated';
export const DAILY_EVENT_PARTICIPANT_LEFT = 'participant-left';

export const DAILY_EVENT_ACCESS_STATE_UPDATED = 'access-state-updated';

export const DAILY_EVENT_MEETING_SESSION_UPDATED = 'meeting-session-updated';

export const DAILY_EVENT_WAITING_PARTICIPANT_ADDED =
  'waiting-participant-added';
export const DAILY_EVENT_WAITING_PARTICIPANT_UPDATED =
  'waiting-participant-updated';
export const DAILY_EVENT_WAITING_PARTICIPANT_REMOVED =
  'waiting-participant-removed';

export const DAILY_EVENT_TRACK_STARTED = 'track-started';
export const DAILY_EVENT_TRACK_STOPPED = 'track-stopped';

export const DAILY_EVENT_TRANSCRIPTION_STARTED = 'transcription-started';
export const DAILY_EVENT_TRANSCRIPTION_STOPPED = 'transcription-stopped';
export const DAILY_EVENT_TRANSCRIPTION_ERROR = 'transcription-error';

export const DAILY_EVENT_RECORDING_STARTED = 'recording-started';
export const DAILY_EVENT_RECORDING_STOPPED = 'recording-stopped';
export const DAILY_EVENT_RECORDING_STATS = 'recording-stats';
export const DAILY_EVENT_RECORDING_ERROR = 'recording-error';
export const DAILY_EVENT_RECORDING_UPLOAD_COMPLETED =
  'recording-upload-completed';
export const DAILY_EVENT_RECORDING_DATA = 'recording-data';
export const DAILY_EVENT_APP_MSG = 'app-message';
export const DAILY_EVENT_INPUT_EVENT = 'input-event';

export const DAILY_EVENT_REMOTE_MEDIA_PLAYER_STARTED =
  'remote-media-player-started';
export const DAILY_EVENT_REMOTE_MEDIA_PLAYER_UPDATED =
  'remote-media-player-updated';
export const DAILY_EVENT_REMOTE_MEDIA_PLAYER_STOPPED =
  'remote-media-player-stopped';
export const DAILY_REMOTE_MEDIA_PLAYER_ERROR_TYPE = 'remote-media-player-error';

export const DAILY_EVENT_LOCAL_SCREEN_SHARE_STARTED =
  'local-screen-share-started';
export const DAILY_EVENT_LOCAL_SCREEN_SHARE_STOPPED =
  'local-screen-share-stopped';
export const DAILY_EVENT_ACTIVE_SPEAKER_CHANGE = 'active-speaker-change';
export const DAILY_EVENT_ACTIVE_SPEAKER_MODE_CHANGE =
  'active-speaker-mode-change';
export const DAILY_EVENT_NETWORK_QUALITY_CHANGE = 'network-quality-change';
export const DAILY_EVENT_NETWORK_CONNECTION = 'network-connection';

export const DAILY_EVENT_FULLSCREEN = 'fullscreen';
export const DAILY_EVENT_EXIT_FULLSCREEN = 'exited-fullscreen';

export const DAILY_EVENT_LIVE_STREAMING_STARTED = 'live-streaming-started';
export const DAILY_EVENT_LIVE_STREAMING_STOPPED = 'live-streaming-stopped';
export const DAILY_EVENT_LIVE_STREAMING_ERROR = 'live-streaming-error';

export const DAILY_EVENT_LANG_UPDATED = 'lang-updated';

export const DAILY_EVENT_SHOW_LOCAL_VIDEO_CHANGED = 'show-local-video-changed';

export const DAILY_EVENT_RECEIVE_SETTINGS_UPDATED = 'receive-settings-updated';

export const DAILY_EVENT_INPUT_SETTINGS_UPDATED = 'input-settings-updated';
export const DAILY_EVENT_NONFATAL_ERROR = 'nonfatal-error';
export const DAILY_INPUT_SETTINGS_ERROR_TYPE = 'input-settings-error';
export const DAILY_SCREEN_SHARE_ERROR_TYPE = 'screen-share-error';
export const DAILY_VIDEO_PROCESSOR_ERROR_TYPE = 'video-processor-error';
export const DAILY_EVENT_ERROR = 'error';

//
// internal
//

export const MAX_APP_MSG_SIZE = 1024 * 4;

export const IFRAME_MESSAGE_MARKER = 'iframe-call-message';

export const DAILY_METHOD_SET_THEME = 'set-theme';
export const DAILY_METHOD_START_CAMERA = 'start-camera';
export const DAILY_METHOD_SET_INPUT_DEVICES = 'set-input-devices';
export const DAILY_METHOD_SET_OUTPUT_DEVICE = 'set-output-device';
export const DAILY_METHOD_GET_INPUT_DEVICES = 'get-input-devices';
export const DAILY_METHOD_JOIN = 'join-meeting';
export const DAILY_METHOD_LEAVE = 'leave-meeting';
export const DAILY_METHOD_UPDATE_PARTICIPANT = 'update-participant';
export const DAILY_METHOD_UPDATE_PARTICIPANTS = 'update-participants';
export const DAILY_METHOD_LOCAL_AUDIO = 'local-audio';
export const DAILY_METHOD_LOCAL_VIDEO = 'local-video';
export const DAILY_METHOD_START_SCREENSHARE = 'local-screen-start';
export const DAILY_METHOD_STOP_SCREENSHARE = 'local-screen-stop';
export const DAILY_METHOD_START_RECORDING = 'local-recording-start';
export const DAILY_METHOD_UPDATE_RECORDING = 'daily-method-update-recording';
export const DAILY_METHOD_STOP_RECORDING = 'local-recording-stop';
export const DAILY_METHOD_LOAD_CSS = 'load-css';
export const DAILY_METHOD_SET_BANDWIDTH = 'set-bandwidth';
export const DAILY_METHOD_GET_CALC_STATS = 'get-calc-stats';
export const DAILY_METHOD_ENUMERATE_DEVICES = 'enumerate-devices';
export const DAILY_METHOD_CYCLE_CAMERA = 'cycle-camera';
export const DAILY_METHOD_CYCLE_MIC = 'cycle-mic';
export const DAILY_METHOD_GET_CAMERA_FACING_MODE = 'get-camera-facing-mode';
export const DAILY_METHOD_APP_MSG = 'app-msg';
export const DAILY_METHOD_ADD_FAKE_PARTICIPANT = 'add-fake-participant';
export const DAILY_METHOD_SET_SHOW_NAMES = 'set-show-names';
export const DAILY_METHOD_SET_SHOW_LOCAL_VIDEO = 'set-show-local-video';
export const DAILY_METHOD_SET_SHOW_PARTICIPANTS_BAR =
  'set-show-participants-bar';
export const DAILY_METHOD_SET_ACTIVE_SPEAKER_MODE = 'set-active-speaker-mode';
export const DAILY_METHOD_REGISTER_INPUT_HANDLER = 'register-input-handler';
export const DAILY_METHOD_GET_LANG = 'get-daily-lang';
export const DAILY_METHOD_SET_LANG = 'set-daily-lang';
export const DAILY_METHOD_GET_MEETING_SESSION = 'get-meeting-session';
export const DAILY_METHOD_SET_USER_NAME = 'set-user-name';
export const DAILY_METHOD_DETECT_ALL_FACES = 'detect-all-faces';
export const DAILY_METHOD_ROOM = 'lib-room-info';
export const DAILY_METHOD_GET_NETWORK_TOPOLOGY = 'get-network-topology';
export const DAILY_METHOD_SET_NETWORK_TOPOLOGY = 'set-network-topology';
export const DAILY_METHOD_SET_PLAY_DING = 'daily-method-set-play-ding';
export const DAILY_METHOD_SET_SUBSCRIBE_TO_TRACKS_AUTOMATICALLY =
  'daily-method-subscribe-to-tracks-automatically';
export const DAILY_METHOD_START_LIVE_STREAMING =
  'daily-method-start-live-streaming';
export const DAILY_METHOD_UPDATE_LIVE_STREAMING =
  'daily-method-update-live-streaming';
export const DAILY_METHOD_STOP_LIVE_STREAMING =
  'daily-method-stop-live-streaming';
export const DAILY_METHOD_START_REMOTE_MEDIA_PLAYER =
  'daily-method-start-remote-media-player';
export const DAILY_METHOD_STOP_REMOTE_MEDIA_PLAYER =
  'daily-method-stop-remote-media-player';
export const DAILY_METHOD_UPDATE_REMOTE_MEDIA_PLAYER =
  'daily-method-update-remote-media-player';
export const DAILY_METHOD_START_TRANSCRIPTION =
  'daily-method-start-transcription';
export const DAILY_METHOD_STOP_TRANSCRIPTION =
  'daily-method-stop-transcription';
export const DAILY_METHOD_PREAUTH = 'daily-method-preauth';
export const DAILY_METHOD_REQUEST_ACCESS = 'daily-method-request-access';
export const DAILY_METHOD_UPDATE_WAITING_PARTICIPANT =
  'daily-method-update-waiting-participant';
export const DAILY_METHOD_UPDATE_WAITING_PARTICIPANTS =
  'daily-method-update-waiting-participants';
export const DAILY_METHOD_GET_SINGLE_PARTICIPANT_RECEIVE_SETTINGS =
  'get-single-participant-receive-settings';
export const DAILY_METHOD_UPDATE_RECEIVE_SETTINGS = 'update-receive-settings';
export const DAILY_METHOD_UPDATE_INPUT_SETTINGS = 'update-input-settings';

export const DAILY_CUSTOM_TRACK = 'daily-custom-track';
export const DAILY_UI_REQUEST_FULLSCREEN = 'request-fullscreen';
export const DAILY_UI_EXIT_FULLSCREEN = 'request-exit-fullscreen';

export const DAILY_JS_NETWORK_QUALITY = {
  VERY_LOW: 'very-low',
  LOW: 'low',
  HIGH: 'high',
};

export const DAILY_JS_NETWORK_THRESHOLDS = {
  VERY_LOW: 'very-low',
  LOW: 'low',
  GOOD: 'good',
};

// video processor settings enum
export const DAILY_JS_VIDEO_PROCESSOR_TYPES = {
  NONE: 'none',
  BGBLUR: 'background-blur',
  BGIMAGE: 'background-image',
  // CUSTOM: 'custom',
};

export const DAILY_JS_REMOTE_MEDIA_PLAYER_SETTING = {
  PLAY: 'play',
  PAUSE: 'pause',
};

export const DAILY_JS_REMOTE_MEDIA_PLAYER_STATE = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  BUFFERING: 'buffering',
  STOPPED: 'stopped',
};

export const PARTICIPANT_TYPE = {
  REMOTE_MEDIA_PLAYER: 'remote-media-player',
};

export const DAILY_PRESELECTED_BG_IMAGE_URLS_LENGTH = 10;

export const DAILY_SUPPORTED_BG_IMG_TYPES = ['jpg', 'png', 'jpeg'];
