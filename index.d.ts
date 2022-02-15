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
  | 'de'
  | 'en'
  | 'es'
  | 'fi'
  | 'fr'
  | 'it'
  | 'jp'
  | 'ka'
  | 'nl'
  | 'no'
  | 'pl'
  | 'pt'
  | 'ru'
  | 'sv'
  | 'tr';

export type DailyLanguageSetting = DailyLanguage | 'user';

export type DailyEvent =
  | 'loading'
  | 'load-attempt-failed'
  | 'loaded'
  | 'started-camera'
  | 'camera-error'
  | 'joining-meeting'
  | 'joined-meeting'
  | 'left-meeting'
  | 'participant-joined'
  | 'participant-updated'
  | 'participant-left'
  | 'track-started'
  | 'track-stopped'
  | 'recording-started'
  | 'recording-stopped'
  | 'recording-stats'
  | 'recording-error'
  | 'recording-upload-completed'
  | 'recording-data'
  | 'transcription-started'
  | 'transcription-stopped'
  | 'transcription-error'
  | 'app-message'
  | 'local-screen-share-started'
  | 'local-screen-share-stopped'
  | 'active-speaker-change'
  | 'active-speaker-mode-change'
  | 'network-quality-change'
  | 'network-connection'
  | 'fullscreen'
  | 'exited-fullscreen'
  | 'error'
  | 'nonfatal-error'
  | 'click'
  | 'mousedown'
  | 'mouseup'
  | 'mouseover'
  | 'mousemove'
  | 'touchstart'
  | 'touchmove'
  | 'touchend'
  | 'live-streaming-started'
  | 'live-streaming-stopped'
  | 'live-streaming-error'
  | 'lang-updated'
  | 'remote-media-player-started'
  | 'remote-media-player-stopped'
  | 'remote-media-player-updated'
  | 'access-state-updated'
  | 'meeting-session-updated'
  | 'waiting-participant-added'
  | 'waiting-participant-updated'
  | 'waiting-participant-removed'
  | 'theme-updated'
  | 'receive-settings-updated'
  | 'input-settings-updated'
  | 'show-local-video-changed';

export type DailyMeetingState =
  | 'new'
  | 'loading'
  | 'loaded'
  | 'joining-meeting'
  | 'joined-meeting'
  | 'left-meeting'
  | 'error';

export type DailyCameraErrorType =
  | 'cam-in-use'
  | 'mic-in-use'
  | 'cam-mic-in-use';

export type DailyFatalErrorType =
  | 'ejected'
  | 'nbf-room'
  | 'nbf-token'
  | 'exp-room'
  | 'exp-token';

export type DailyNonFatalErrorType =
  | 'input-settings-error'
  | 'screen-share-error'
  | 'video-processor-error'
  | 'remote-media-player-error';

export type DailyNetworkTopology = 'sfu' | 'peer';

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

export interface DailyCallOptions {
  url?: string;
  token?: string;
  lang?: DailyLanguageSetting;
  activeSpeakerMode?: boolean;
  showLeaveButton?: boolean;
  showParticipantsBar?: boolean;
  showLocalVideo?: boolean;
  showFullscreenButton?: boolean;
  iframeStyle?: Partial<CSSStyleDeclaration>;
  customLayout?: boolean;
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
}

export interface DailyLoadOptions extends DailyCallOptions {
  baseUrl?: string;
}

export interface DailyAdvancedConfig {
  experimentalChromeVideoMuteLightOff?: boolean;
  experimentalGetUserMediaConstraintsModify?: (
    constraints: MediaStreamConstraints
  ) => void;
  fastConnect?: boolean;
  preferH264ForCam?: boolean;
  preferH264ForScreenSharing?: boolean;
  preferH264?: boolean;
  disableSimulcast?: boolean;
  h264Profile?: string;
  camSimulcastEncodings?: any[];
  screenSimulcastEncodings?: any[];
  useDevicePreferenceCookies?: boolean;
}

export interface DailyTrackState {
  subscribed: DailyTrackSubscriptionState;
  state:
    | 'blocked'
    | 'off'
    | 'sendable'
    | 'loading'
    | 'interrupted'
    | 'playable';
  blocked?: {
    byDeviceMissing?: boolean;
    byDeviceInUse?: boolean;
    byPermissions?: boolean;
  };
  off?: {
    byUser?: boolean;
    byRemoteRequest?: boolean;
    byBandwidth?: boolean;
  };
  track?: MediaStreamTrack;
}

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
  };

  // user/session info
  user_id: string;
  user_name: string;
  session_id: string;
  joined_at: Date;
  will_eject_at: Date;
  local: boolean;
  owner: boolean;
  record: boolean;

  // video element info (iframe-based calls using standard UI only)
  cam_info: {} | DailyVideoElementInfo;
  screen_info: {} | DailyVideoElementInfo;
}

export interface DailyWaitingParticipant {
  id: string;
  name: string;
  awaitingAccess: SpecifiedDailyAccess;
}

export type DailyTrackSubscriptionState = 'staged' | boolean;

export type DailyTrackSubscriptionOptions =
  | DailyTrackSubscriptionState
  | 'avatar'
  | {
      audio?: DailyTrackSubscriptionState;
      video?: DailyTrackSubscriptionState;
      screenVideo?: DailyTrackSubscriptionState;
      screenAudio?: DailyTrackSubscriptionState;
    };

export interface DailyParticipantUpdateOptions {
  setAudio?: boolean;
  setVideo?: boolean;
  setSubscribedTracks?: DailyTrackSubscriptionOptions;
  eject?: true;
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
    };
    worstVideoRecvPacketLoss: number;
    worstVideoSendPacketLoss: number;
  };
  threshold: 'good' | 'low' | 'very-low';
}

export interface DailyPendingRoomInfo {
  roomUrlPendingJoin: string;
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
    enable_chat?: boolean;
    enable_knocking?: boolean;
    enable_network_ui?: boolean;
    enable_people_ui?: boolean;
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
    lang?: '' | DailyLanguageSetting;
    sfu_switchover?: number;
    signaling_impl?: string;
    geo?: string;
  };
  domainConfig: {
    hide_daily_branding?: boolean;
    redirect_on_meeting_exit?: string;
    hipaa?: boolean;
    sfu_impl?: string;
    signaling_impl?: string;
    sfu_switchover?: number;
    lang?: '' | DailyLanguageSetting;
    max_api_rooms?: number;
    webhook_meeting_end?: any;
    max_live_streams?: number;
    enable_advanced_chat?: boolean;
    enable_network_ui?: boolean;
    enable_people_ui?: boolean;
    enable_prejoin_ui?: boolean;
    enable_video_processing_ui?: boolean;
  };
  tokenConfig: {
    eject_at_token_exp?: boolean;
    eject_after_elapsed?: boolean;
    nbf?: number;
    exp?: number;
    is_owner?: boolean;
    user_name?: string;
    user_id?: string;
    enable_screenshare?: boolean;
    start_video_off?: boolean;
    start_audio_off?: boolean;
    enable_recording?: string;
    start_cloud_recording?: boolean;
    close_tab_on_exit?: boolean;
    redirect_on_meeting_exit?: string;
    lang?: '' | DailyLanguageSetting;
  };
  dialInPIN?: string;
}

export interface DailyMeetingSession {
  id: string;
}

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
  layer?: number | 'inherit';
}

export interface DailySingleParticipantReceiveSettingsUpdates {
  video?: DailyVideoReceiveSettingsUpdates | 'inherit';
  screenVideo?: DailyVideoReceiveSettingsUpdates | 'inherit';
}

export interface DailyReceiveSettingsUpdates {
  [participantIdOrBaseOrStar: string]:
    | DailySingleParticipantReceiveSettingsUpdates
    | 'inherit';
}

export interface DailyInputSettings {
  video?: DailyInputVideoSettings;
}

export interface DailyInputVideoSettings {
  processor?: DailyInputVideoProcessorSettings;
}
export interface DailyInputVideoProcessorSettings {
  type: 'none' | 'background-blur' | 'background-image';
  config?: {};
}
export interface DailyEventObjectNoPayload {
  action: Extract<
    DailyEvent,
    | 'loading'
    | 'loaded'
    | 'joining-meeting'
    | 'left-meeting'
    | 'recording-stopped'
    | 'recording-stats'
    | 'recording-error'
    | 'recording-upload-completed'
    | 'fullscreen'
    | 'exited-fullscreen'
    | 'live-streaming-started'
    | 'live-streaming-stopped'
  >;
}

export interface DailyEventObjectCameraError {
  action: Extract<DailyEvent, 'camera-error'>;
  errorMsg: {
    errorMsg: string;
    audioOk?: boolean;
    videoOk?: boolean;
  };
  error?: {
    type: DailyCameraErrorType;
    localizedMsg?: string;
  };
}

export interface DailyEventObjectFatalError {
  action: Extract<DailyEvent, 'error'>;
  errorMsg: string;
  error?: {
    type: DailyFatalErrorType;
    localizedMsg?: string;
  };
}

export interface DailyEventObjectNonFatalError {
  action: Extract<DailyEvent, 'nonfatal-error'>;
  type: DailyNonFatalErrorType;
  errorMsg: string;
}

export interface DailyEventObjectGenericError {
  action: Extract<DailyEvent, 'load-attempt-failed' | 'live-streaming-error'>;
  errorMsg: string;
}

export interface DailyEventObjectParticipants {
  action: Extract<DailyEvent, 'joined-meeting'>;
  participants: DailyParticipantsObject;
}

export interface DailyEventObjectParticipant {
  action: Extract<
    DailyEvent,
    'participant-joined' | 'participant-updated' | 'participant-left'
  >;
  participant: DailyParticipant;
}

export interface DailyEventObjectWaitingParticipant {
  action: Extract<
    DailyEvent,
    | 'waiting-participant-added'
    | 'waiting-participant-updated'
    | 'waiting-participant-removed'
  >;
  participant: DailyWaitingParticipant;
}

export interface DailyEventObjectAccessState extends DailyAccessState {
  action: Extract<DailyEvent, 'access-state-updated'>;
}

export interface DailyEventObjectMeetingSessionUpdated {
  action: Extract<DailyEvent, 'meeting-session-updated'>;
  meetingSession: DailyMeetingSession;
}

export interface DailyEventObjectTrack {
  action: Extract<DailyEvent, 'track-started' | 'track-stopped'>;
  participant: DailyParticipant | null; // null if participant left meeting
  track: MediaStreamTrack;
}

export interface DailyEventObjectRecordingStarted {
  action: Extract<DailyEvent, 'recording-started'>;
  local?: boolean;
  recordingId?: string;
  startedBy?: string;
  type?: string;
  layout?: DailyStreamingLayoutConfig;
}

export interface DailyEventObjectMouseEvent {
  action: Extract<
    DailyEvent,
    'click' | 'mousedown' | 'mouseup' | 'mouseover' | 'mousemove'
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
  action: Extract<DailyEvent, 'touchstart' | 'touchmove' | 'touchend'>;
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
  action: Extract<DailyEvent, 'network-quality-change'>;
  threshold: 'good' | 'low' | 'very-low';
  quality: number;
}

export type NetworkConnectionType = 'signaling' | 'peer-to-peer' | 'sfu';

export interface DailyEventObjectNetworkConnectionEvent {
  action: Extract<DailyEvent, 'network-connection'>;
  type: NetworkConnectionType;
  event: string;
  session_id?: string;
  sfu_id?: string;
}

export interface DailyEventObjectActiveSpeakerChange {
  action: Extract<DailyEvent, 'active-speaker-change'>;
  activeSpeaker: {
    peerId: string;
  };
}

export interface DailyEventObjectActiveSpeakerModeChange {
  action: Extract<DailyEvent, 'active-speaker-mode-change'>;
  enabled: boolean;
}

export interface DailyEventObjectAppMessage<Data = any> {
  action: Extract<DailyEvent, 'app-message'>;
  data: Data;
  fromId: string;
}

export interface DailyEventObjectLangUpdated {
  action: Extract<DailyEvent, 'lang-updated'>;
  lang: DailyLanguage;
  langSetting: DailyLanguageSetting;
}

export interface DailyEventObjectThemeUpdated {
  action: Extract<DailyEvent, 'theme-updated'>;
  theme: DailyThemeConfig;
}

export interface DailyEventObjectReceiveSettingsUpdated {
  action: Extract<DailyEvent, 'receive-settings-updated'>;
  receiveSettings: DailyReceiveSettings;
}

export interface DailyEventObjectShowLocalVideoChanged {
  action: Extract<DailyEvent, 'show-local-video-changed'>;
  show: boolean;
}
export interface DailyEventObjectInputSettingsUpdated {
  action: Extract<DailyEvent, 'input-settings-updated'>;
  inputSettings: DailyInputSettings;
}

export interface DailyEventObjectLiveStreamingStarted {
  action: Extract<DailyEvent, 'live-streaming-started'>;
  layout?: DailyStreamingLayoutConfig;
}

export interface DailyEventObjectRemoteMediaPlayerUpdate {
  action: Extract<
    DailyEvent,
    'remote-media-player-started' | 'remote-media-player-updated'
  >;
  updatedBy: string;
  session_id: string;
  remoteMediaPlayerState: DailyRemoteMediaPlayerState;
}

export interface DailyEventObjectRemoteMediaPlayerStopped {
  action: Extract<DailyEvent, 'remote-media-player-stopped'>;
  session_id: string;
  updatedBy: string;
  reason: DailyRemoteMediaPlayerStopReason;
}

export type DailyEventObject<
  T extends DailyEvent = any
> = T extends DailyEventObjectAppMessage['action']
  ? DailyEventObjectAppMessage
  : T extends DailyEventObjectNoPayload['action']
  ? DailyEventObjectNoPayload
  : T extends DailyEventObjectCameraError['action']
  ? DailyEventObjectCameraError
  : T extends DailyEventObjectFatalError['action']
  ? DailyEventObjectFatalError
  : T extends DailyEventObjectNonFatalError['action']
  ? DailyEventObjectNonFatalError
  : T extends DailyEventObjectGenericError['action']
  ? DailyEventObjectGenericError
  : T extends DailyEventObjectParticipants['action']
  ? DailyEventObjectParticipants
  : T extends DailyEventObjectParticipant['action']
  ? DailyEventObjectParticipant
  : T extends DailyEventObjectWaitingParticipant['action']
  ? DailyEventObjectWaitingParticipant
  : T extends DailyEventObjectAccessState['action']
  ? DailyEventObjectAccessState
  : T extends DailyEventObjectMeetingSessionUpdated['action']
  ? DailyEventObjectMeetingSessionUpdated
  : T extends DailyEventObjectTrack['action']
  ? DailyEventObjectTrack
  : T extends DailyEventObjectRecordingStarted['action']
  ? DailyEventObjectRecordingStarted
  : T extends DailyEventObjectRemoteMediaPlayerUpdate['action']
  ? DailyEventObjectRemoteMediaPlayerUpdate
  : T extends DailyEventObjectRemoteMediaPlayerStopped['action']
  ? DailyEventObjectRemoteMediaPlayerStopped
  : T extends DailyEventObjectMouseEvent['action']
  ? DailyEventObjectMouseEvent
  : T extends DailyEventObjectTouchEvent['action']
  ? DailyEventObjectTouchEvent
  : T extends DailyEventObjectNetworkQualityEvent['action']
  ? DailyEventObjectNetworkQualityEvent
  : T extends DailyEventObjectNetworkConnectionEvent['action']
  ? DailyEventObjectNetworkConnectionEvent
  : T extends DailyEventObjectActiveSpeakerChange['action']
  ? DailyEventObjectActiveSpeakerChange
  : T extends DailyEventObjectActiveSpeakerModeChange['action']
  ? DailyEventObjectActiveSpeakerModeChange
  : T extends DailyEventObjectLangUpdated['action']
  ? DailyEventObjectLangUpdated
  : T extends DailyEventObjectThemeUpdated['action']
  ? DailyEventObjectThemeUpdated
  : T extends DailyEventObjectReceiveSettingsUpdated['action']
  ? DailyEventObjectReceiveSettingsUpdated
  : T extends DailyEventObjectShowLocalVideoChanged['action']
  ? DailyEventObjectShowLocalVideoChanged
  : T extends DailyEventObjectInputSettingsUpdated['action']
  ? DailyEventObjectInputSettingsUpdated
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
  createCallObject(properties?: DailyCallOptions): DailyCall;
  wrap(iframe: HTMLIFrameElement, properties?: DailyCallOptions): DailyCall;
  createFrame(
    parentElement: HTMLElement,
    properties?: DailyCallOptions
  ): DailyCall;
  createFrame(properties?: DailyCallOptions): DailyCall;
  createTransparentFrame(properties?: DailyCallOptions): DailyCall;
}

export interface DailyCallStaticUtils {
  supportedBrowser(): DailyBrowserInfo;
  version(): string;
}

export interface DailyStreamingDefaultLayoutConfig {
  preset: 'default';
  max_cam_streams?: number;
}

export interface DailyStreamingSingleParticipantLayoutConfig {
  preset: 'single-participant';
  session_id: string;
}

export interface DailyStreamingActiveParticipantLayoutConfig {
  preset: 'active-participant';
}

export type DailyStreamingPortraitLayoutVariant = 'vertical' | 'inset';

export interface DailyStreamingPortraitLayoutConfig {
  preset: 'portrait';
  variant?: DailyStreamingPortraitLayoutVariant;
  max_cam_streams?: number;
}

export type DailyStreamingLayoutConfig =
  | DailyStreamingDefaultLayoutConfig
  | DailyStreamingSingleParticipantLayoutConfig
  | DailyStreamingActiveParticipantLayoutConfig
  | DailyStreamingPortraitLayoutConfig;

export type DailyRemoteMediaPlayerSettingPlay = 'play';
export type DailyRemoteMediaPlayerSettingPause = 'pause';

export type DailyRemoteMediaPlayerStatePlaying = 'playing';
export type DailyRemoteMediaPlayerStatePaused = 'paused';
export type DailyRemoteMediaPlayerStateBuffering = 'buffering';

export type DailyRemoteMediaPlayerEOS = 'EOS';
export type DailyRemoteMediaPlayerPeerStopped = 'stopped-by-peer';

export type DailyRemoteMediaPlayerStopReason =
  | DailyRemoteMediaPlayerEOS
  | DailyRemoteMediaPlayerPeerStopped;

export type DailyAccess = 'unknown' | SpecifiedDailyAccess;

export type SpecifiedDailyAccess = { level: 'none' | 'lobby' | 'full' };

export type DailyAccessState = {
  access: DailyAccess;
  awaitingAccess?: SpecifiedDailyAccess;
};

export type DailyAccessRequest = {
  access?: { level: 'full' };
  name: string;
};

export interface DailyStreamingOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  layout?: DailyStreamingLayoutConfig;
}

export interface DailyLiveStreamingOptions extends DailyStreamingOptions {
  rtmpUrl: string;
}

export interface RemoteMediaPlayerSimulcastEncoding {
  maxBitrate: number;
  maxFramerate?: number;
  scaleResolutionDownBy?: number;
}

export interface DailyRemoteMediaPlayerSettings {
  state: DailyRemoteMediaPlayerSettingPlay | DailyRemoteMediaPlayerSettingPause;
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

export interface DailyCall {
  iframe(): HTMLIFrameElement | null;
  join(properties?: DailyCallOptions): Promise<DailyParticipantsObject | void>;
  leave(): Promise<void>;
  destroy(): Promise<void>;
  loadCss(properties: {
    bodyClass?: string;
    cssFile?: string;
    cssText?: string;
  }): DailyCall;
  meetingState(): DailyMeetingState;
  accessState(): DailyAccessState;
  participants(): DailyParticipantsObject;
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
  setBandwidth(bw: {
    kbs?: number | 'NO_CAP' | null;
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
  setUserName(
    name: string,
    options?: { thisMeetingOnly?: boolean }
  ): Promise<{ userName: string }>;
  startCamera(properties?: DailyCallOptions): Promise<DailyDeviceInfos>;
  cycleCamera(): Promise<{ device?: MediaDeviceInfo | null }>;
  cycleMic(): Promise<{ device?: MediaDeviceInfo | null }>;
  setInputDevices(devices: {
    audioDeviceId?: string | false;
    audioSource?: MediaStreamTrack | false;
    videoDeviceId?: string | false;
    videoSource?: MediaStreamTrack | false;
  }): DailyCall;
  setInputDevicesAsync(devices: {
    audioDeviceId?: string | false;
    audioSource?: MediaStreamTrack | false;
    videoDeviceId?: string | false;
    videoSource?: MediaStreamTrack | false;
  }): Promise<DailyDeviceInfos>;
  setOutputDevice(audioDevice: { outputDeviceId?: string }): DailyCall;
  getInputDevices(): Promise<DailyDeviceInfos>;
  preAuth(properties?: DailyCallOptions): Promise<{ access: DailyAccess }>;
  load(properties?: DailyLoadOptions): Promise<void>;
  startScreenShare(captureOptions?: DailyScreenCaptureOptions): void;
  stopScreenShare(): void;
  startRecording(options?: DailyStreamingOptions): void;
  updateRecording(options: { layout?: DailyStreamingLayoutConfig }): void;
  stopRecording(): void;
  startLiveStreaming(options: DailyLiveStreamingOptions): void;
  updateLiveStreaming(options: { layout?: DailyStreamingLayoutConfig }): void;
  stopLiveStreaming(): void;
  startRemoteMediaPlayer(
    options: DailyRemoteMediaPlayerStartOptions
  ): Promise<DailyRemoteMediaPlayerInfo>;
  stopRemoteMediaPlayer(session_id: string): Promise<void>;
  updateRemoteMediaPlayer(
    options: DailyRemoteMediaPlayerUpdateOptions
  ): Promise<DailyRemoteMediaPlayerInfo>;
  startTranscription(): void;
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
  setShowNamesMode(mode: false | 'always' | 'never'): DailyCall;
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
    topology: DailyNetworkTopology | 'none';
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
