// Type definitions for daily-js
// Project: https://github.com/daily-co/daily-js
// Definitions by: Paul Kompfner <https://github.com/kompfner>

/**
 * --- BROWSER-SPECIFIC TYPES ---
 */

/// <reference lib="dom" />

/**
 * --- DAILY-JS API ---
 */

export type DailyLanguage =
  | "de"
  | "en"
  | "es"
  | "fi"
  | "fr"
  | "it"
  | "jp"
  | "ka"
  | "nl"
  | "no"
  | "pl"
  | "pt"
  | "ru"
  | "sv"
  | "tr";

export type DailyLanguageSetting = DailyLanguage | "user";

export type DailyEvent =
  | "loading"
  | "load-attempt-failed"
  | "loaded"
  | "started-camera"
  | "camera-error"
  | "joining-meeting"
  | "joined-meeting"
  | "left-meeting"
  | "participant-joined"
  | "participant-updated"
  | "participant-left"
  | "participant-counts-updated"
  | "track-started"
  | "track-stopped"
  | "recording-started"
  | "recording-stopped"
  | "recording-stats"
  | "recording-error"
  | "recording-upload-completed"
  | "recording-data"
  | "transcription-started"
  | "transcription-stopped"
  | "transcription-error"
  | "app-message"
  | "local-screen-share-started"
  | "local-screen-share-stopped"
  | "active-speaker-change"
  | "active-speaker-mode-change"
  | "network-quality-change"
  | "network-connection"
  | "fullscreen"
  | "exited-fullscreen"
  | "error"
  | "nonfatal-error"
  | "click"
  | "mousedown"
  | "mouseup"
  | "mouseover"
  | "mousemove"
  | "touchstart"
  | "touchmove"
  | "touchend"
  | "live-streaming-started"
  | "live-streaming-updated"
  | "live-streaming-stopped"
  | "live-streaming-error"
  | "lang-updated"
  | "remote-media-player-started"
  | "remote-media-player-stopped"
  | "remote-media-player-updated"
  | "access-state-updated"
  | "meeting-session-updated"
  | "meeting-session-state-updated"
  | "waiting-participant-added"
  | "waiting-participant-updated"
  | "waiting-participant-removed"
  | "theme-updated"
  | "available-devices-updated"
  | "receive-settings-updated"
  | "input-settings-updated"
  | "show-local-video-changed"
  | "selected-devices-updated"
  | "custom-button-click";

export type DailyMeetingState =
  | "new"
  | "loading"
  | "loaded"
  | "joining-meeting"
  | "joined-meeting"
  | "left-meeting"
  | "error";

export type DailyCameraErrorType =
  | "cam-in-use"
  | "mic-in-use"
  | "cam-mic-in-use"
  | "permissions"
  | "undefined-mediadevices"
  | "not-found"
  | "constraints"
  | "unknown";

export type DailyFatalErrorType =
  | "ejected"
  | "nbf-room"
  | "nbf-token"
  | "exp-room"
  | "exp-token"
  | "meeting-full"
  | "end-of-life"
  | "not-allowed";

export type DailyNonFatalErrorType =
  | "input-settings-error"
  | "screen-share-error"
  | "video-processor-error"
  | "remote-media-player-error"
  | "live-streaming-warning"
  | "meeting-session-data-error";

export type DailyNetworkTopology = "sfu" | "peer";

export interface DailyParticipantsObject {
  local: DailyParticipant;
  [id: string]: DailyParticipant;
}

export interface DailyBrowserInfo {
  supported: boolean;
  mobile: boolean;
  name: string;
  version: string;
  supportsFullscreen: boolean;
  supportsScreenShare: boolean;
  supportsSfu: boolean;
  supportsVideoProcessing: boolean;
  supportsAudioProcessing: boolean;
}

export interface DailyThemeColors {
  /**
   * Main theme color. Used for primary actions and keyboard focus.
   */
  accent?: string;
  /**
   * Text color rendered on `accent`.
   */
  accentText?: string;
  /**
   * Background color.
   */
  background?: string;
  /**
   * Background color for highlighted elements.
   */
  backgroundAccent?: string;
  /**
   * Default text color, as rendered on `background` or `backgroundAccent`.
   */
  baseText?: string;
  /**
   * Default border color for bordered elements.
   */
  border?: string;
  /**
   * Background color for the call main area.
   */
  mainAreaBg?: string;
  /**
   * Background color for video tiles.
   */
  mainAreaBgAccent?: string;
  /**
   * Text color for text rendered inside the call main area, e.g. names.
   */
  mainAreaText?: string;
  /**
   * Text color for supportive, less emphasized, text.
   */
  supportiveText?: string;
}

export type DailyTheme = {
  colors: DailyThemeColors;
};
export type DailyThemeConfig =
  | DailyTheme
  | {
      light: DailyTheme;
      dark: DailyTheme;
    };

export interface DailyGridLayoutConfig {
  maxTilesPerPage?: number;
  minTilesPerPage?: number;
}
export interface DailyLayoutConfig {
  grid?: DailyGridLayoutConfig;
}

export interface DailyCustomTrayButton {
  iconPath: string;
  iconPathDarkMode?: string;
  label: string;
  tooltip: string;
}

export interface DailyCustomTrayButtons {
  [id: string]: DailyCustomTrayButton;
}

export interface DailyCallOptions {
  url?: string;
  token?: string;
  lang?: DailyLanguageSetting;
  activeSpeakerMode?: boolean;
  showLeaveButton?: boolean;
  showParticipantsBar?: boolean;
  showLocalVideo?: boolean;
  showFullscreenButton?: boolean;
  showUserNameChangeUI?: boolean;
  iframeStyle?: Partial<CSSStyleDeclaration>;
  customLayout?: boolean;
  customTrayButtons?: DailyCustomTrayButtons;
  bodyClass?: string;
  cssFile?: string;
  cssText?: string;
  dailyConfig?: DailyAdvancedConfig;
  subscribeToTracksAutomatically?: boolean;
  videoSource?: string | MediaStreamTrack | boolean;
  audioSource?: string | MediaStreamTrack | boolean;
  theme?: DailyThemeConfig;
  layoutConfig?: DailyLayoutConfig;
  receiveSettings?: DailyReceiveSettings;
  inputSettings?: DailyInputSettings;
  userName?: string;
  userData?: unknown;
  startVideoOff?: boolean;
  startAudioOff?: boolean;
}

export interface StartCustomTrackOptions {
  track: MediaStreamTrack;
  mode?: "music" | "speech" | DailyMicAudioModeSettings | undefined;
  trackName?: string;
}

export interface DailyLoadOptions extends DailyCallOptions {
  baseUrl?: string;
}

export interface DailyFactoryOptions extends DailyCallOptions {
  strictMode?: boolean; // only available at constructor time
}

export interface DailyMicAudioModeSettings {
  bitrate?: number;
  stereo?: boolean;
}

export interface DailyAdvancedConfig {
  camSimulcastEncodings?: any[];
  disableSimulcast?: boolean;
  experimentalChromeVideoMuteLightOff?: boolean;
  keepCamIndicatorLightOn?: boolean;
  experimentalGetUserMediaConstraintsModify?: (
    constraints: MediaStreamConstraints
  ) => void;
  fastConnect?: boolean;
  h264Profile?: string;
  micAudioMode?: "music" | "speech" | DailyMicAudioModeSettings;
  noAutoDefaultDeviceChange?: boolean;
  preferH264?: boolean;
  preferH264ForCam?: boolean;
  preferH264ForScreenSharing?: boolean;
  screenSimulcastEncodings?: any[];
  useDevicePreferenceCookies?: boolean;
  userMediaAudioConstraints?: MediaTrackConstraints;
  userMediaVideoConstraints?: MediaTrackConstraints;
  avoidEval?: boolean;
  callObjectBundleUrlOverride?: string;
  enableIndependentDevicePermissionPrompts?: boolean;
}

export interface DailyTrackState {
  subscribed: DailyTrackSubscriptionState;
  state:
    | "blocked"
    | "off"
    | "sendable"
    | "loading"
    | "interrupted"
    | "playable";
  blocked?: {
    byDeviceMissing?: boolean;
    byDeviceInUse?: boolean;
    byPermissions?: boolean;
  };
  off?: {
    byUser?: boolean;
    byRemoteRequest?: boolean;
    byBandwidth?: boolean;
    byCanSendPermission?: boolean;
    byServerLimit?: boolean;
  };
  // guaranteed-playable reference to the track
  // (it's only present when state === 'playable')
  track?: MediaStreamTrack;
  // not-guaranteed-playable reference to the track
  // (it may be present when state !== 'playable')
  // useful, for instance, for avoiding Safari's remote-track-unmute-in-background-tab bug
  // (see https://github.com/daily-demos/call-object-react/blob/c81b21262dead2aacbd5a2f534d0fee8530acfe4/src/components/Tile/Tile.js#L53-L60)
  persistentTrack?: MediaStreamTrack;
}

export interface DailyParticipantPermissions {
  hasPresence: boolean;
  canSend:
    | Set<
        | "video"
        | "audio"
        | "screenVideo"
        | "screenAudio"
        | "customVideo"
        | "customAudio"
      >
    | boolean;
}

export type DailyParticipantPermissionsUpdate = {
  [Property in keyof DailyParticipantPermissions]+?: DailyParticipantPermissions[Property];
};

export interface DailyParticipant {
  // tracks
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  screenVideoTrack?: MediaStreamTrack;
  screenAudioTrack?: MediaStreamTrack;

  // legacy track state
  audio: boolean;
  video: boolean;
  screen: boolean;

  // new track state
  tracks: {
    audio: DailyTrackState;
    video: DailyTrackState;
    screenAudio: DailyTrackState;
    screenVideo: DailyTrackState;
    rmpAudio?: DailyTrackState;
    rmpVideo?: DailyTrackState;
  };

  // user/session info
  user_id: string;
  user_name: string;
  userData?: unknown;
  session_id: string;
  joined_at?: Date;
  will_eject_at: Date;
  local: boolean;
  owner: boolean;
  permissions: DailyParticipantPermissions;
  record: boolean;
  participantType?: string;

  // video element info (iframe-based calls using standard UI only)
  cam_info: {} | DailyVideoElementInfo;
  screen_info: {} | DailyVideoElementInfo;
}

export interface DailyParticipantCounts {
  present: number;
  hidden: number;
}

export interface DailyWaitingParticipant {
  id: string;
  name: string;
  awaitingAccess: SpecifiedDailyAccess;
}

export type DailyTrackSubscriptionState = "staged" | boolean;

export type DailyCustomTrackSubscriptionState =
  | DailyTrackSubscriptionState
  | { [name: string]: DailyTrackSubscriptionState };

export type DailyTrackSubscriptionOptions =
  | DailyTrackSubscriptionState
  | "avatar"
  | {
      audio?: DailyTrackSubscriptionState;
      video?: DailyTrackSubscriptionState;
      screenVideo?: DailyTrackSubscriptionState;
      screenAudio?: DailyTrackSubscriptionState;
      custom?: DailyCustomTrackSubscriptionState;
    };

export interface DailyParticipantUpdateOptions {
  setAudio?: boolean;
  setVideo?: boolean;
  setSubscribedTracks?: DailyTrackSubscriptionOptions;
  eject?: true;
  updatePermissions?: DailyParticipantPermissionsUpdate;
  styles?: DailyParticipantCss;
}

export interface DailyWaitingParticipantUpdateOptions {
  grantRequestedAccess?: boolean;
}

export interface DailyParticipantCss {
  cam?: DailyParticipantStreamCss;
  screen?: DailyParticipantStreamCss;
}

export interface DailyParticipantStreamCss {
  div?: Partial<CSSStyleDeclaration>;
  overlay?: Partial<CSSStyleDeclaration>;
  video?: Partial<CSSStyleDeclaration>;
}

export interface DailyVideoElementInfo {
  width: number;
  height: number;
  left: number;
  top: number;
  video_width: number;
  video_height: number;
}

export interface DailyDeviceInfos {
  camera: {} | MediaDeviceInfo;
  mic: {} | MediaDeviceInfo;
  speaker: {} | MediaDeviceInfo;
}

export interface DailyScreenCaptureOptions {
  audio?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  chromeMediaSourceId?: string;
  mediaStream?: MediaStream;
}

export interface DailyNetworkStats {
  quality: number;
  stats: {
    latest: {
      recvBitsPerSecond: number;
      sendBitsPerSecond: number;
      timestamp: number;
      videoRecvBitsPerSecond: number;
      videoRecvPacketLoss: number;
      videoSendBitsPerSecond: number;
      videoSendPacketLoss: number;
      totalSendPacketLoss: number;
      totalRecvPacketLoss: number;
    };
    worstVideoRecvPacketLoss: number;
    worstVideoSendPacketLoss: number;
  };
  threshold: "good" | "low" | "very-low";
}

export interface DailyPendingRoomInfo {
  roomUrlPendingJoin: string;
}

export interface DailyRecordingsBucket {
  allow_api_access: boolean;
  assume_role_arn: string;
  bucket_name: string;
  bucket_region: string;
}

export interface DailyRoomInfo {
  id: string;
  name: string;
  config: {
    nbf?: number;
    exp?: number;
    max_participants?: number;
    enable_screenshare?: boolean;
    enable_advanced_chat?: boolean;
    enable_breakout_rooms?: boolean;
    enable_emoji_reactions?: boolean;
    enable_chat?: boolean;
    enable_hand_raising?: boolean;
    enable_knocking?: boolean;
    enable_network_ui?: boolean;
    enable_noise_cancellation_ui?: boolean;
    enable_people_ui?: boolean;
    enable_pip_ui?: boolean;
    enable_prejoin_ui?: boolean;
    enable_video_processing_ui?: boolean;
    experimental_optimize_large_calls?: boolean;
    start_video_off?: boolean;
    start_audio_off?: boolean;
    owner_only_broadcast?: boolean;
    audio_only?: boolean;
    enable_recording?: string;
    enable_dialin?: boolean;
    autojoin?: boolean;
    eject_at_room_exp?: boolean;
    eject_after_elapsed?: number;
    lang?: "" | DailyLanguageSetting;
    sfu_switchover?: number;
    signaling_impl?: string;
    geo?: string;
    recordings_bucket?: DailyRecordingsBucket;
  };
  domainConfig: {
    hide_daily_branding?: boolean;
    redirect_on_meeting_exit?: string;
    hipaa?: boolean;
    sfu_impl?: string;
    signaling_impl?: string;
    sfu_switchover?: number;
    lang?: "" | DailyLanguageSetting;
    max_api_rooms?: number;
    webhook_meeting_end?: any;
    max_live_streams?: number;
    max_streaming_instances_per_room?: number;
    enable_advanced_chat?: boolean;
    enable_breakout_rooms?: boolean;
    enable_emoji_reactions?: boolean;
    enable_chat?: boolean;
    enable_hand_raising?: boolean;
    enable_network_ui?: boolean;
    enable_noise_cancellation_ui?: boolean;
    enable_people_ui?: boolean;
    enable_pip_ui?: boolean;
    enable_prejoin_ui?: boolean;
    enable_transcription?: boolean;
    enable_video_processing_ui?: boolean;
    recordings_bucket?: DailyRecordingsBucket;
  };
  tokenConfig: {
    eject_at_token_exp?: boolean;
    eject_after_elapsed?: boolean;
    nbf?: number;
    exp?: number;
    is_owner?: boolean;
    user_name?: string;
    user_id?: string;
    enable_prejoin_ui?: boolean;
    enable_screenshare?: boolean;
    start_video_off?: boolean;
    start_audio_off?: boolean;
    enable_recording?: string;
    enable_recording_ui?: boolean;
    start_cloud_recording?: boolean;
    close_tab_on_exit?: boolean;
    redirect_on_meeting_exit?: string;
    lang?: "" | DailyLanguageSetting;
  };
  dialInPIN?: string;
}

export interface DailyMeetingSession {
  id: string;
}

export interface DailyMeetingSessionState {
  data: unknown;
  topology: DailyNetworkTopology | "none";
}

export type DailySessionDataMergeStrategy = "replace" | "shallow-merge";

export interface DailyVideoReceiveSettings {
  layer?: number;
}
export interface DailySingleParticipantReceiveSettings {
  video?: DailyVideoReceiveSettings;
  screenVideo?: DailyVideoReceiveSettings;
}

export interface DailyReceiveSettings {
  [participantIdOrBase: string]: DailySingleParticipantReceiveSettings;
}

export interface DailyVideoReceiveSettingsUpdates {
  layer?: number | "inherit";
}

export interface DailySingleParticipantReceiveSettingsUpdates {
  video?: DailyVideoReceiveSettingsUpdates | "inherit";
  screenVideo?: DailyVideoReceiveSettingsUpdates | "inherit";
}

export interface DailyReceiveSettingsUpdates {
  [participantIdOrBaseOrStar: string]:
    | DailySingleParticipantReceiveSettingsUpdates
    | "inherit";
}

export interface DailyInputSettings {
  audio?: DailyInputAudioSettings;
  video?: DailyInputVideoSettings;
}

export interface DailyInputAudioSettings {
  processor?: DailyInputAudioProcessorSettings;
}

export interface DailyInputAudioProcessorSettings {
  type: "none" | "noise-cancellation";
}

export interface DailyInputVideoSettings {
  processor?: DailyInputVideoProcessorSettings;
}
export interface DailyInputVideoProcessorSettings {
  type: "none" | "background-blur" | "background-image";
  config?: {};
}

export interface DailyEventObjectNoPayload {
  action: Extract<
    DailyEvent,
    | "loading"
    | "loaded"
    | "joining-meeting"
    | "left-meeting"
    | "recording-stats"
    | "recording-upload-completed"
    | "fullscreen"
    | "exited-fullscreen"
  >;
}

export type DailyCameraError = {
  msg: string;
  localizedMsg?: string;
};

export interface DailyCamPermissionsError extends DailyCameraError {
  type: Extract<DailyCameraErrorType, "permissions">;
  blockedBy: "user" | "browser";
  blockedMedia: Set<"video" | "audio">;
}

export interface DailyCamDeviceNotFoundError extends DailyCameraError {
  type: Extract<DailyCameraErrorType, "not-found">;
  missingMedia: Set<"video" | "audio">;
}

export interface DailyCamConstraintsError extends DailyCameraError {
  type: Extract<DailyCameraErrorType, "constraints">;
  reason: Set<"invalid" | "none-specified">;
}

export interface DailyCamInUseError extends DailyCameraError {
  type: Extract<
    DailyCameraErrorType,
    "cam-in-use" | "mic-in-use" | "cam-mic-in-use"
  >;
}

export interface DailyCamTypeError extends DailyCameraError {
  type: Extract<DailyCameraErrorType, "undefined-mediadevices">;
}

export interface DailyCamUnknownError extends DailyCameraError {
  type: Extract<DailyCameraErrorType, "unknown">;
}

export type DailyCameraErrorObject<T extends DailyCameraError = any> =
  T extends DailyCamPermissionsError["type"]
    ? DailyCamPermissionsError
    : T extends DailyCamDeviceNotFoundError["type"]
    ? DailyCamDeviceNotFoundError
    : T extends DailyCamConstraintsError["type"]
    ? DailyCamConstraintsError
    : T extends DailyCamInUseError["type"]
    ? DailyCamInUseError
    : T extends DailyCamTypeError["type"]
    ? DailyCamTypeError
    : T extends DailyCamUnknownError["type"]
    ? DailyCamUnknownError
    : any;

export interface DailyEventObjectCameraError {
  action: Extract<DailyEvent, "camera-error">;
  errorMsg: {
    errorMsg: string;
    audioOk?: boolean;
    videoOk?: boolean;
  };
  error: DailyCameraErrorObject;
}

export interface DailyEventObjectFatalError {
  action: Extract<DailyEvent, "error">;
  errorMsg: string;
  error?: {
    type: DailyFatalErrorType;
    localizedMsg?: string;
  };
}

export interface DailyEventObjectNonFatalError {
  action: Extract<DailyEvent, "nonfatal-error">;
  type: DailyNonFatalErrorType;
  errorMsg: string;
  details?: any;
}

export interface DailyEventObjectGenericError {
  action: Extract<DailyEvent, "load-attempt-failed">;
  errorMsg: string;
}

export interface DailyEventObjectLiveStreamingError {
  action: Extract<DailyEvent, "live-streaming-error">;
  errorMsg: string;
  instanceId?: string;
  actionTraceId?: string;
}

export interface DailyEventObjectParticipants {
  action: Extract<DailyEvent, "joined-meeting">;
  participants: DailyParticipantsObject;
}

export interface DailyEventObjectParticipant {
  action: Extract<DailyEvent, "participant-joined" | "participant-updated">;
  participant: DailyParticipant;
}

// only 1 reason reported for now. more to come.
export type DailyParticipantLeftReason = "hidden";

export interface DailyEventObjectParticipantLeft {
  action: Extract<DailyEvent, "participant-left">;
  participant: DailyParticipant;
  // reason undefined if participant left for any reason other than those listed
  // in DailyParticipantLeftReason
  reason?: DailyParticipantLeftReason;
}

export interface DailyEventObjectParticipantCounts {
  action: Extract<DailyEvent, "participant-counts-updated">;
  participantCounts: DailyParticipantCounts;
}

export interface DailyEventObjectWaitingParticipant {
  action: Extract<
    DailyEvent,
    | "waiting-participant-added"
    | "waiting-participant-updated"
    | "waiting-participant-removed"
  >;
  participant: DailyWaitingParticipant;
}

export interface DailyEventObjectAccessState extends DailyAccessState {
  action: Extract<DailyEvent, "access-state-updated">;
}

export interface DailyEventObjectMeetingSessionUpdated {
  action: Extract<DailyEvent, "meeting-session-updated">;
  meetingSession: DailyMeetingSession;
}

export interface DailyEventObjectMeetingSessionStateUpdated {
  action: Extract<DailyEvent, "meeting-session-state-updated">;
  meetingSessionState: DailyMeetingSessionState;
}

export interface DailyEventObjectTrack {
  action: Extract<DailyEvent, "track-started" | "track-stopped">;
  participant: DailyParticipant | null; // null if participant left meeting
  track: MediaStreamTrack;
  type:
    | "video"
    | "audio"
    | "screenVideo"
    | "screenAudio"
    | "rmpVideo"
    | "rmpAudio"
    | string; // string - for custom tracks
}

export interface DailyEventObjectRecordingStarted {
  action: Extract<DailyEvent, "recording-started">;
  local?: boolean;
  recordingId?: string;
  startedBy?: string;
  type?: string;
  layout?: DailyStreamingLayoutConfig;
  instanceId?: string;
}

export interface DailyEventObjectRecordingStopped {
  action: Extract<DailyEvent, "recording-stopped">;
  instanceId?: string;
}

export interface DailyEventObjectRecordingError {
  action: Extract<DailyEvent, "recording-error">;
  errorMsg: string;
  instanceId?: string;
  actionTraceId?: string;
}

export interface DailyEventObjectRecordingData {
  action: Extract<DailyEvent, "recording-data">;
  data: Uint8Array;
  finished: boolean;
}

export interface DailyEventObjectMouseEvent {
  action: Extract<
    DailyEvent,
    "click" | "mousedown" | "mouseup" | "mouseover" | "mousemove"
  >;
  event: {
    type: string;
    button: number;
    x: number;
    y: number;
    pageX: number;
    pageY: number;
    screenX: number;
    screenY: number;
    offsetX: number;
    offsetY: number;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
  };
  participant: DailyParticipant;
}

export interface DailyEventObjectTouchEvent {
  action: Extract<DailyEvent, "touchstart" | "touchmove" | "touchend">;
  event: {
    type: string;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
  };
  participant: DailyParticipant;
}

export interface DailyEventObjectNetworkQualityEvent {
  action: Extract<DailyEvent, "network-quality-change">;
  threshold: "good" | "low" | "very-low";
  quality: number;
}

export type NetworkConnectionType = "signaling" | "peer-to-peer" | "sfu";

export interface DailyEventObjectNetworkConnectionEvent {
  action: Extract<DailyEvent, "network-connection">;
  type: NetworkConnectionType;
  event: string;
  session_id?: string;
  sfu_id?: string;
}

export interface DailyEventObjectActiveSpeakerChange {
  action: Extract<DailyEvent, "active-speaker-change">;
  activeSpeaker: {
    peerId: string;
  };
}

export interface DailyEventObjectActiveSpeakerModeChange {
  action: Extract<DailyEvent, "active-speaker-mode-change">;
  enabled: boolean;
}

export interface DailyEventObjectAppMessage<Data = any> {
  action: Extract<DailyEvent, "app-message">;
  data: Data;
  fromId: string;
}

export interface DailyEventObjectLangUpdated {
  action: Extract<DailyEvent, "lang-updated">;
  lang: DailyLanguage;
  langSetting: DailyLanguageSetting;
}

export interface DailyEventObjectThemeUpdated {
  action: Extract<DailyEvent, "theme-updated">;
  theme: DailyThemeConfig;
}

export interface DailyEventObjectReceiveSettingsUpdated {
  action: Extract<DailyEvent, "receive-settings-updated">;
  receiveSettings: DailyReceiveSettings;
}

export interface DailyEventObjectAvailableDevicesUpdated {
  action: Extract<DailyEvent, "available-devices-updated">;
  availableDevices: MediaDeviceInfo[];
}

export interface DailyEventObjectShowLocalVideoChanged {
  action: Extract<DailyEvent, "show-local-video-changed">;
  show: boolean;
}
export interface DailyEventObjectInputSettingsUpdated {
  action: Extract<DailyEvent, "input-settings-updated">;
  inputSettings: DailyInputSettings;
}

export interface DailyEventObjectLiveStreamingStarted {
  action: Extract<DailyEvent, "live-streaming-started">;
  layout?: DailyStreamingLayoutConfig;
  instanceId?: string;
}
export interface DailyEventObjectLiveStreamingUpdated {
  action: Extract<DailyEvent, "live-streaming-updated">;
  endpoint?: DailyStreamingEndpoint;
  state: DailyStreamingState;
  instanceId?: string;
}

export interface DailyEventObjectLiveStreamingStopped {
  action: Extract<DailyEvent, "live-streaming-stopped">;
  instanceId?: string;
}

export interface DailyEventObjectTranscriptionStarted {
  action: Extract<DailyEvent, "transcription-started">;
  language: string;
  model: string;
  tier?: string;
  detect_language?: boolean;
  profanity_filter?: boolean;
  redact?: Array<string> | boolean;
  startedBy: string;
}

export interface DailyEventObjectTranscriptionStopped {
  action: Extract<DailyEvent, "transcription-stopped">;
  updatedBy: string;
}

export interface DailyEventObjectRemoteMediaPlayerUpdate {
  action: Extract<
    DailyEvent,
    "remote-media-player-started" | "remote-media-player-updated"
  >;
  updatedBy: string;
  session_id: string;
  remoteMediaPlayerState: DailyRemoteMediaPlayerState;
}

export interface DailyEventObjectRemoteMediaPlayerStopped {
  action: Extract<DailyEvent, "remote-media-player-stopped">;
  session_id: string;
  updatedBy: string;
  reason: DailyRemoteMediaPlayerStopReason;
}

export interface DailyEventObjectCustomButtonClick {
  action: Extract<DailyEvent, "custom-button-click">;
  button_id: string;
}

export interface DailyEventObjectSelectedDevicesUpdated {
  action: Extract<DailyEvent, "selected-devices-updated">;
  devices: DailyDeviceInfos;
}

export type DailyEventObject<T extends DailyEvent = any> =
  T extends DailyEventObjectAppMessage["action"]
    ? DailyEventObjectAppMessage
    : T extends DailyEventObjectNoPayload["action"]
    ? DailyEventObjectNoPayload
    : T extends DailyEventObjectCameraError["action"]
    ? DailyEventObjectCameraError
    : T extends DailyEventObjectFatalError["action"]
    ? DailyEventObjectFatalError
    : T extends DailyEventObjectNonFatalError["action"]
    ? DailyEventObjectNonFatalError
    : T extends DailyEventObjectGenericError["action"]
    ? DailyEventObjectGenericError
    : T extends DailyEventObjectParticipants["action"]
    ? DailyEventObjectParticipants
    : T extends DailyEventObjectLiveStreamingStarted["action"]
    ? DailyEventObjectLiveStreamingStarted
    : T extends DailyEventObjectLiveStreamingUpdated["action"]
    ? DailyEventObjectLiveStreamingUpdated
    : T extends DailyEventObjectLiveStreamingStopped["action"]
    ? DailyEventObjectLiveStreamingStopped
    : T extends DailyEventObjectLiveStreamingError["action"]
    ? DailyEventObjectLiveStreamingError
    : T extends DailyEventObjectParticipant["action"]
    ? DailyEventObjectParticipant
    : T extends DailyEventObjectParticipantLeft["action"]
    ? DailyEventObjectParticipantLeft
    : T extends DailyEventObjectParticipantCounts["action"]
    ? DailyEventObjectParticipantCounts
    : T extends DailyEventObjectWaitingParticipant["action"]
    ? DailyEventObjectWaitingParticipant
    : T extends DailyEventObjectAccessState["action"]
    ? DailyEventObjectAccessState
    : T extends DailyEventObjectMeetingSessionUpdated["action"]
    ? DailyEventObjectMeetingSessionUpdated
    : T extends DailyEventObjectMeetingSessionStateUpdated["action"]
    ? DailyEventObjectMeetingSessionStateUpdated
    : T extends DailyEventObjectTrack["action"]
    ? DailyEventObjectTrack
    : T extends DailyEventObjectRecordingStarted["action"]
    ? DailyEventObjectRecordingStarted
    : T extends DailyEventObjectRecordingStopped["action"]
    ? DailyEventObjectRecordingStopped
    : T extends DailyEventObjectRecordingError["action"]
    ? DailyEventObjectRecordingError
    : T extends DailyEventObjectRecordingData["action"]
    ? DailyEventObjectRecordingData
    : T extends DailyEventObjectRemoteMediaPlayerUpdate["action"]
    ? DailyEventObjectRemoteMediaPlayerUpdate
    : T extends DailyEventObjectRemoteMediaPlayerStopped["action"]
    ? DailyEventObjectRemoteMediaPlayerStopped
    : T extends DailyEventObjectMouseEvent["action"]
    ? DailyEventObjectMouseEvent
    : T extends DailyEventObjectTouchEvent["action"]
    ? DailyEventObjectTouchEvent
    : T extends DailyEventObjectNetworkQualityEvent["action"]
    ? DailyEventObjectNetworkQualityEvent
    : T extends DailyEventObjectNetworkConnectionEvent["action"]
    ? DailyEventObjectNetworkConnectionEvent
    : T extends DailyEventObjectActiveSpeakerChange["action"]
    ? DailyEventObjectActiveSpeakerChange
    : T extends DailyEventObjectActiveSpeakerModeChange["action"]
    ? DailyEventObjectActiveSpeakerModeChange
    : T extends DailyEventObjectLangUpdated["action"]
    ? DailyEventObjectLangUpdated
    : T extends DailyEventObjectThemeUpdated["action"]
    ? DailyEventObjectThemeUpdated
    : T extends DailyEventObjectReceiveSettingsUpdated["action"]
    ? DailyEventObjectReceiveSettingsUpdated
    : T extends DailyEventObjectAvailableDevicesUpdated["action"]
    ? DailyEventObjectAvailableDevicesUpdated
    : T extends DailyEventObjectShowLocalVideoChanged["action"]
    ? DailyEventObjectShowLocalVideoChanged
    : T extends DailyEventObjectInputSettingsUpdated["action"]
    ? DailyEventObjectInputSettingsUpdated
    : T extends DailyEventObjectCustomButtonClick["action"]
    ? DailyEventObjectCustomButtonClick
    : T extends DailyEventObjectSelectedDevicesUpdated["action"]
    ? DailyEventObjectSelectedDevicesUpdated
    : any;

export interface DailyFaceInfo {
  score: number;
  viewportBox: {
    width: number;
    height: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

export interface DailyCallFactory {
  createCallObject(properties?: DailyFactoryOptions): DailyCall;
  wrap(iframe: HTMLIFrameElement, properties?: DailyFactoryOptions): DailyCall;
  createFrame(
    parentElement: HTMLElement,
    properties?: DailyFactoryOptions
  ): DailyCall;
  createFrame(properties?: DailyFactoryOptions): DailyCall;
  createTransparentFrame(properties?: DailyFactoryOptions): DailyCall;
  getCallInstance(): DailyCall;
}

export interface DailyCallStaticUtils {
  supportedBrowser(): DailyBrowserInfo;
  version(): string;
}

export interface DailyStreamingDefaultLayoutConfig {
  preset: "default";
  max_cam_streams?: number;
}

export interface DailyStreamingSingleParticipantLayoutConfig {
  preset: "single-participant";
  session_id: string;
}

export interface DailyStreamingActiveParticipantLayoutConfig {
  preset: "active-participant";
}

export type DailyStreamingPortraitLayoutVariant = "vertical" | "inset";

export interface DailyStreamingPortraitLayoutConfig {
  preset: "portrait";
  variant?: DailyStreamingPortraitLayoutVariant;
  max_cam_streams?: number;
}

export interface DailyStreamingCustomLayoutConfig {
  preset: "custom";
  composition_id: string;
  composition_params?: {
    [key: string]: boolean | number | string;
  };
  session_assets?: {
    [key: string]: string;
  };
}

export type DailyStreamingLayoutConfig =
  | DailyStreamingDefaultLayoutConfig
  | DailyStreamingSingleParticipantLayoutConfig
  | DailyStreamingActiveParticipantLayoutConfig
  | DailyStreamingPortraitLayoutConfig
  | DailyStreamingCustomLayoutConfig;

export type DailyStreamingState = "connected" | "interrupted";

export type DailyRemoteMediaPlayerSettingPlay = "play";
export type DailyRemoteMediaPlayerSettingPause = "pause";

export type DailyRemoteMediaPlayerStatePlaying = "playing";
export type DailyRemoteMediaPlayerStatePaused = "paused";
export type DailyRemoteMediaPlayerStateBuffering = "buffering";

export type DailyRemoteMediaPlayerEOS = "EOS";
export type DailyRemoteMediaPlayerPeerStopped = "stopped-by-peer";

export type DailyRemoteMediaPlayerStopReason =
  | DailyRemoteMediaPlayerEOS
  | DailyRemoteMediaPlayerPeerStopped;

export type DailyAccess = "unknown" | SpecifiedDailyAccess;

export type SpecifiedDailyAccess = { level: "none" | "lobby" | "full" };

export type DailyAccessState = {
  access: DailyAccess;
  awaitingAccess?: SpecifiedDailyAccess;
};

export type DailyAccessRequest = {
  access?: { level: "full" };
  name: string;
};

export interface DailyStreamingOptions {
  width?: number;
  height?: number;
  fps?: number;
  videoBitrate?: number;
  audioBitrate?: number;
  minIdleTimeOut?: number;
  maxDuration?: number;
  backgroundColor?: string;
  instanceId?: string;
  layout?: DailyStreamingLayoutConfig;
}

export interface DailyStreamingEndpoint {
  endpoint: string;
}

export interface DailyLiveStreamingOptions extends DailyStreamingOptions {
  rtmpUrl?: string | string[];
  endpoints?: DailyStreamingEndpoint[];
}

export interface RemoteMediaPlayerSimulcastEncoding {
  maxBitrate: number;
  maxFramerate?: number;
  scaleResolutionDownBy?: number;
}

export interface DailyRemoteMediaPlayerSettings {
  state?:
    | DailyRemoteMediaPlayerSettingPlay
    | DailyRemoteMediaPlayerSettingPause;
  volume?: number;
  simulcastEncodings?: RemoteMediaPlayerSimulcastEncoding[];
}

export interface DailyRemoteMediaPlayerStartOptions {
  url: string;
  settings?: DailyRemoteMediaPlayerSettings;
}

export interface DailyRemoteMediaPlayerUpdateOptions {
  session_id: string;
  settings: DailyRemoteMediaPlayerSettings;
}

export interface DailyRemoteMediaPlayerState {
  state:
    | DailyRemoteMediaPlayerStatePlaying
    | DailyRemoteMediaPlayerStatePaused
    | DailyRemoteMediaPlayerStateBuffering;
  settings: DailyRemoteMediaPlayerSettings;
}

export interface DailyRemoteMediaPlayerInfo {
  session_id: string;
  remoteMediaPlayerState: DailyRemoteMediaPlayerState;
}

export interface DailyTranscriptionDeepgramOptions {
  language?: string;
  model?: string;
  tier?: string;
  detect_language?: boolean;
  profanity_filter?: boolean;
  redact?: Array<string> | boolean;
}

export interface DailyCall {
  iframe(): HTMLIFrameElement | null;
  join(properties?: DailyCallOptions): Promise<DailyParticipantsObject | void>;
  leave(): Promise<void>;
  destroy(): Promise<void>;
  isDestroyed(): boolean;
  loadCss(properties: {
    bodyClass?: string;
    cssFile?: string;
    cssText?: string;
  }): DailyCall;
  meetingState(): DailyMeetingState;
  accessState(): DailyAccessState;
  participants(): DailyParticipantsObject;
  participantCounts(): DailyParticipantCounts;
  updateParticipant(
    sessionId: string,
    updates: DailyParticipantUpdateOptions
  ): DailyCall;
  updateParticipants(updates: {
    [sessionId: string]: DailyParticipantUpdateOptions;
  }): DailyCall;
  waitingParticipants(): { [id: string]: DailyWaitingParticipant };
  updateWaitingParticipant(
    id: string,
    updates: DailyWaitingParticipantUpdateOptions
  ): Promise<{ id: string }>;
  updateWaitingParticipants(updates: {
    [id: string]: DailyWaitingParticipantUpdateOptions;
  }): Promise<{ ids: string[] }>;
  requestAccess(
    access: DailyAccessRequest
  ): Promise<{ access: DailyAccess; granted: boolean }>;
  localAudio(): boolean;
  localVideo(): boolean;
  setLocalAudio(enabled: boolean): DailyCall;
  setLocalVideo(enabled: boolean): DailyCall;
  getReceiveSettings(
    id: string,
    options?: { showInheritedValues: boolean }
  ): Promise<DailySingleParticipantReceiveSettings>;
  getReceiveSettings(): Promise<DailyReceiveSettings>;
  updateReceiveSettings(
    receiveSettings: DailyReceiveSettingsUpdates
  ): Promise<DailyReceiveSettings>;
  updateInputSettings(
    inputSettings: DailyInputSettings
  ): Promise<DailyInputSettings>;
  getInputSettings(): Promise<DailyInputSettings>;
  updateCustomTrayButtons(customTrayButtons: DailyCustomTrayButtons): DailyCall;
  customTrayButtons(): DailyCustomTrayButtons;
  setBandwidth(bw: {
    kbs?: number | "NO_CAP" | null;
    trackConstraints?: MediaTrackConstraints;
  }): DailyCall;
  getDailyLang(): Promise<{
    lang: DailyLanguage;
    langSetting: DailyLanguageSetting;
  }>;
  setDailyLang(lang: DailyLanguageSetting): DailyCall;
  getMeetingSession(): Promise<{
    meetingSession: DailyMeetingSession;
  }>;
  meetingSessionState(): DailyMeetingSessionState;
  setMeetingSessionData(
    data: unknown,
    mergeStrategy?: DailySessionDataMergeStrategy
  ): void;
  setUserName(
    name: string,
    options?: { thisMeetingOnly?: boolean }
  ): Promise<{ userName: string }>;
  setUserData(data: unknown): Promise<{ userData: unknown }>;
  startCamera(properties?: DailyCallOptions): Promise<DailyDeviceInfos>;
  cycleCamera(): Promise<{ device?: MediaDeviceInfo | null }>;
  cycleMic(): Promise<{ device?: MediaDeviceInfo | null }>;
  setInputDevices(devices: {
    audioDeviceId?: string | false | null;
    audioSource?: MediaStreamTrack | false;
    videoDeviceId?: string | false | null;
    videoSource?: MediaStreamTrack | false;
  }): DailyCall;
  startCustomTrack(properties: StartCustomTrackOptions): Promise<string>;
  stopCustomTrack(trackName: string): Promise<string>;
  setInputDevicesAsync(devices: {
    audioDeviceId?: string | false | null;
    audioSource?: MediaStreamTrack | false;
    videoDeviceId?: string | false | null;
    videoSource?: MediaStreamTrack | false;
  }): Promise<DailyDeviceInfos>;
  setOutputDeviceAsync(audioDevice: {
    outputDeviceId?: string;
  }): Promise<DailyDeviceInfos>;
  setOutputDevice(audioDevice: { outputDeviceId?: string }): DailyCall;
  getInputDevices(): Promise<DailyDeviceInfos>;
  preAuth(properties?: DailyCallOptions): Promise<{ access: DailyAccess }>;
  load(properties?: DailyLoadOptions): Promise<void>;
  startScreenShare(captureOptions?: DailyScreenCaptureOptions): void;
  stopScreenShare(): void;
  startRecording(options?: DailyStreamingOptions): void;
  updateRecording(options: {
    layout?: DailyStreamingLayoutConfig;
    instanceId?: string;
  }): void;
  stopRecording(options?: { instanceId: string }): void;
  startLiveStreaming(options: DailyLiveStreamingOptions): void;
  updateLiveStreaming(options: {
    layout?: DailyStreamingLayoutConfig;
    instanceId?: string;
  }): void;
  addLiveStreamingEndpoints(options: {
    endpoints: DailyStreamingEndpoint[];
    instanceId?: string;
  }): void;
  removeLiveStreamingEndpoints(options: {
    endpoints: DailyStreamingEndpoint[];
    instanceId?: string;
  }): void;
  stopLiveStreaming(options?: { instanceId: string }): void;
  startRemoteMediaPlayer(
    options: DailyRemoteMediaPlayerStartOptions
  ): Promise<DailyRemoteMediaPlayerInfo>;
  stopRemoteMediaPlayer(session_id: string): Promise<void>;
  updateRemoteMediaPlayer(
    options: DailyRemoteMediaPlayerUpdateOptions
  ): Promise<DailyRemoteMediaPlayerInfo>;
  startTranscription(options?: DailyTranscriptionDeepgramOptions): void;
  stopTranscription(): void;
  getNetworkStats(): Promise<DailyNetworkStats>;
  getActiveSpeaker(): { peerId?: string };
  setActiveSpeakerMode(enabled: boolean): DailyCall;
  activeSpeakerMode(): boolean;
  subscribeToTracksAutomatically(): boolean;
  setSubscribeToTracksAutomatically(enabled: boolean): DailyCall;
  enumerateDevices(): Promise<{ devices: MediaDeviceInfo[] }>;
  sendAppMessage(data: any, to?: string): DailyCall;
  addFakeParticipant(details?: { aspectRatio: number }): DailyCall;
  setShowNamesMode(mode: false | "always" | "never"): DailyCall;
  setShowLocalVideo(show: boolean): DailyCall;
  setShowParticipantsBar(show: boolean): DailyCall;
  theme(): DailyThemeConfig;
  setTheme(theme: DailyThemeConfig): Promise<DailyThemeConfig>;
  showLocalVideo(): boolean;
  showParticipantsBar(): boolean;
  detectAllFaces(): Promise<{
    faces?: { [id: string]: DailyFaceInfo[] };
  }>;
  requestFullscreen(): Promise<void>;
  exitFullscreen(): void;
  room(options?: {
    includeRoomConfigDefaults: boolean;
  }): Promise<DailyPendingRoomInfo | DailyRoomInfo | null>;
  geo(): Promise<{ current: string }>;
  getNetworkTopology(): Promise<{
    topology: DailyNetworkTopology | "none";
    error?: string;
  }>;
  setNetworkTopology(options: {
    topology: DailyNetworkTopology;
  }): Promise<{ workerId?: string; error?: string }>;
  setPlayNewParticipantSound(sound: boolean | number): void;
  on<T extends DailyEvent>(
    event: T,
    handler: (event?: DailyEventObject<T>) => void
  ): DailyCall;
  once<T extends DailyEvent>(
    event: T,
    handler: (event?: DailyEventObject<T>) => void
  ): DailyCall;
  off<T extends DailyEvent>(
    event: T,
    handler: (event?: DailyEventObject<T>) => void
  ): DailyCall;
  properties: {
    dailyConfig?: DailyAdvancedConfig;
    userName?: string;
  };
}

declare const DailyIframe: DailyCallFactory & DailyCallStaticUtils;

export default DailyIframe;
