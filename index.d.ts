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
  | 'fi'
  | 'fr'
  | 'nl'
  | 'pt'
  | 'pl'
  | 'sv'
  | 'es'
  | 'tr'
  | 'it'
  | 'ka'
  | 'jp'
  | 'user';

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
  | 'access-state-updated'
  | 'waiting-participant-added'
  | 'waiting-participant-updated'
  | 'waiting-participant-removed';

export type DailyMeetingState =
  | 'new'
  | 'loading'
  | 'loaded'
  | 'joining-meeting'
  | 'joined-meeting'
  | 'left-meeting'
  | 'error';

export interface DailyParticipantsObject {
  local: DailyParticipant;
  [id: string]: DailyParticipant;
}

export interface DailyBrowserInfo {
  supported: boolean;
  mobile: boolean;
  name: string;
  version: string;
  supportsScreenShare: boolean;
  supportsSfu: boolean;
}

export interface DailyCallOptions {
  url?: string;
  token?: string;
  lang?: DailyLanguage;
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
  videoSource?: string | MediaStreamTrack;
  audioSource?: string | MediaStreamTrack;
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
}

export interface DailyTrackState {
  subscribed: boolean;
  state:
    | 'blocked'
    | 'off'
    | 'sendable'
    | 'loading'
    | 'interrupted'
    | 'playable';
  blocked?: {
    byDeviceMissing?: boolean;
    byPermissions?: boolean;
  };
  off?: {
    byUser?: boolean;
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

export type DailyTrackSubscriptionOptions =
  | boolean
  | 'avatar'
  | {
      audio?: boolean;
      video?: boolean;
      screenVideo?: boolean;
      screenAudio?: boolean;
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
    enable_chat?: boolean;
    enable_knocking?: boolean;
    enable_network_ui?: boolean;
    start_video_off?: boolean;
    start_audio_off?: boolean;
    owner_only_broadcast?: boolean;
    audio_only?: boolean;
    enable_recording?: string;
    enable_dialin?: boolean;
    autojoin?: boolean;
    eject_at_room_exp?: boolean;
    eject_after_elapsed?: number;
    lang?: '' | DailyLanguage;
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
    lang?: '' | DailyLanguage;
    max_api_rooms?: number;
    webhook_meeting_end?: any;
    max_live_streams?: number;
    enable_network_ui?: boolean;
  };
  dialInPIN?: string;
}

export interface DailyEventObjectNoPayload {
  action: Extract<
    DailyEvent,
    | 'loading'
    | 'loaded'
    | 'joining-meeting'
    | 'left-meeting'
    | 'recording-started'
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

export interface DailyEventErrorObject {
  action: Extract<
    DailyEvent,
    'load-attempt-failed' | 'live-streaming-error' | 'error'
  >;
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

export interface DailyEventObjectTrack {
  action: Extract<DailyEvent, 'track-started' | 'track-stopped'>;
  participant: DailyParticipant | null; // null if participant left meeting
  track: MediaStreamTrack;
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
  threshold: string;
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

export interface DailyEventObjectAppMessage {
  action: Extract<DailyEvent, 'app-message'>;
  data: any;
  fromId: string;
}

export type DailyEventObject<
  T extends DailyEvent = any
> = T extends DailyEventObjectAppMessage['action']
  ? DailyEventObjectAppMessage
  : T extends DailyEventObjectNoPayload['action']
  ? DailyEventObjectNoPayload
  : T extends DailyEventErrorObject['action']
  ? DailyEventErrorObject
  : T extends DailyEventObjectParticipants['action']
  ? DailyEventObjectParticipants
  : T extends DailyEventObjectParticipant['action']
  ? DailyEventObjectParticipant
  : T extends DailyEventObjectWaitingParticipant['action']
  ? DailyEventObjectWaitingParticipant
  : T extends DailyEventObjectAccessState['action']
  ? DailyEventObjectAccessState
  : T extends DailyEventObjectTrack['action']
  ? DailyEventObjectTrack
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
}

export interface DailyStreamingSingleParticipantLayoutConfig {
  preset: 'single-participant';
  session_id: string;
}

export type DailyStreamingLayoutConfig =
  | DailyStreamingDefaultLayoutConfig
  | DailyStreamingSingleParticipantLayoutConfig;

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
  setBandwidth(bw: {
    kbs?: number | 'NO_CAP' | null;
    trackConstraints?: MediaTrackConstraints;
  }): DailyCall;
  setDailyLang(lang: DailyLanguage): DailyCall;
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
  startRecording(): void;
  stopRecording(): void;
  startLiveStreaming(options: {
    rtmpUrl: string;
    backgroundColor?: string;
    layout?: DailyStreamingLayoutConfig;
  }): void;
  stopLiveStreaming(): void;
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
  setNetworkTopology(options: {
    topology: 'sfu' | 'peer';
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
  };
}

declare const DailyIframe: DailyCallFactory & DailyCallStaticUtils;

export default DailyIframe;
