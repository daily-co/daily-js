// This is a work-in-progress and incomplete, and not yet exposed through
// package.json. Use at your own risk!

// Type definitions for daily-js 0.9.992-beta.5
// Project: https://github.com/daily-co/daily-js
// Definitions by: Paul Kompfner <https://github.com/kompfner>

/**
 * --- BROWSER-SPECIFIC SECTION ---
 */

/// <reference lib="dom" />

/**
 * --- SECTION DUPLICATED WITH REACT-NATIVE-DAILY-JS ---
 */

export type DailyLanguage = "de" | "en" | "fi" | "fr" | "nl" | "pt";

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
  | "track-started"
  | "track-stopped"
  | "recording-started"
  | "recording-stopped"
  | "recording-stats"
  | "recording-error"
  | "recording-upload-completed"
  | "recording-data"
  | "app-message"
  | "input-event"
  | "local-screen-share-started"
  | "local-screen-share-stopped"
  | "active-speaker-change"
  | "active-speaker-mode-change"
  | "network-quality-change"
  | "network-connection"
  | "fullscreen"
  | "exited-fullscreen"
  | "error";

export type DailyMeetingState =
  | "new"
  | "loading"
  | "loaded"
  | "joining-meeting"
  | "joined-meeting"
  | "left-meeting"
  | "error";

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
  showFullscreenButton?: boolean;
  iframeStyle?: object;
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

export type DailyAdvancedConfig = {
  experimentalChromeVideoMuteLightOff: boolean;
  fastConnect: boolean;
  preferH264ForCam?: boolean;
  preferH264ForScreenSharing?: boolean;
  preferH264?: boolean;
  disableSimulcast?: boolean;
  h264Profile?: string;
  camSimulcastEncodings?: any[];
  screenSimulcastEncodings?: any[];
};

export interface DailyParticipant {
  // audio/video info
  audio: boolean;
  audioTrack?: MediaStreamTrack;
  video: boolean;
  videoTrack?: MediaStreamTrack;
  screen: boolean;
  screenVideoTrack?: MediaStreamTrack;

  // user/session info
  user_id: string;
  user_name: string;
  session_id: string;
  joined_at: Date;
  will_eject_at: Date;
  local: boolean;
  owner: boolean;

  // video element info (iframe-based calls using standard UI only)
  cam_info: {} | DailyVideoElementInfo;
  screen_info: {} | DailyVideoElementInfo;
}

export interface DailyParticipantUpdateOptions {
  setAudio?: boolean;
  setVideo?: boolean;
  eject?: true;
  styles?: DailyParticipantCss;
}

export interface DailyParticipantCss {
  cam?: DailyParticipantStreamCss;
  screen?: DailyParticipantStreamCss;
}

export interface DailyParticipantStreamCss {
  div?: object;
  overlay?: object;
  video?: object;
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
  threshold: "good" | "low" | "very-low";
}

export interface DailyRoomInfo {
  id: string;
  name: string;
  config: {
    nbf?: number;
    exp?: number;
    max_participants?: number;
    enable_chat?: boolean;
    enable_knocking?: boolean;
    enable_recording?: string;
    enable_dialin?: boolean;
    autojoin?: boolean;
    meeting_join_hook?: string;
    eject_at_room_exp?: boolean;
    eject_after_elapsed?: number;
    lang?: "" | DailyLanguage;
    signaling_impl?: string;
    geo?: string;
  };
  dialInPIN?: string;
}

export interface DailyEventObject {
  action: string;
  [payloadProp: string]: any;
}

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
}

export interface DailyCall {
  iframe(): HTMLIFrameElement | null;
  join(properties?: DailyCallOptions): Promise<DailyParticipant[] | void>;
  leave(): Promise<void>;
  destroy(): Promise<void>;
  loadCss(properties: {
    bodyClass?: string;
    cssFile?: string;
    cssText?: string;
  }): DailyCall;
  meetingState(): DailyMeetingState;
  participants(): {
    local: DailyParticipant;
    [id: string]: DailyParticipant;
  };
  updateParticipant(
    sessionId: string,
    updates: DailyParticipantUpdateOptions
  ): DailyCall;
  updateParticipants(updates: {
    [sessionId: string]: DailyParticipantUpdateOptions;
  }): DailyCall;
  localAudio(): boolean;
  localVideo(): boolean;
  setLocalAudio(enabled: boolean): DailyCall;
  setLocalVideo(enabled: boolean): DailyCall;
  setBandwidth(bw: {
    kbs?: number | "NO_CAP" | null;
    trackConstraints?: MediaTrackConstraints;
  }): DailyCall;
  setDailyLang(lang: DailyLanguage): DailyCall;
  startCamera(properties?: DailyCallOptions): Promise<DailyDeviceInfos>;
  cycleCamera(): Promise<{ device?: MediaDeviceInfo | null }>;
  cycleMic(): Promise<{ device?: MediaDeviceInfo | null }>;
  setInputDevices(devices: {
    audioDeviceId?: string;
    audioSource?: MediaStreamTrack;
    videoDeviceId?: string;
    videoSource?: MediaStreamTrack;
  }): DailyCall;
  setOutputDevice(audioDevice: { id?: string }): DailyCall;
  getInputDevices(): Promise<DailyDeviceInfos>;
  load(properties: DailyLoadOptions): Promise<void>;
  startScreenShare(captureOptions?: DailyScreenCaptureOptions): void;
  stopScreenShare(): void;
  startRecording(): void;
  stopRecording(): void;
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
  detectAllFaces(): Promise<{
    faces?: { [id: string]: DailyFaceInfo[] };
  }>;
  requestFullscreen(): Promise<void>;
  exitFullscreen(): void;
  room(): Promise<DailyRoomInfo | null>;
  geo(): Promise<{ current: string }>;
  setNetworkTopology(options: {
    topology: "sfu" | "peer";
  }): Promise<{ workerId?: string; error?: string }>;
  setPlayNewParticipantSound(sound: boolean | number): void;
  on(event: DailyEvent, handler: (event?: DailyEventObject) => void): DailyCall;
  once(
    event: DailyEvent,
    handler: (event?: DailyEventObject) => void
  ): DailyCall;
  off(
    event: DailyEvent,
    handler: (event?: DailyEventObject) => void
  ): DailyCall;
  properties: {
    dailyConfig?: DailyAdvancedConfig;
  };
}

declare const DailyIframe: DailyCallFactory & DailyCallStaticUtils;

export default DailyIframe;
