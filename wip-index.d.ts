// This is a work-in-progress and incomplete, and not yet exposed through
// package.json. Use at your own risk!

// Type definitions for daily-js 0.0.987
// Project: https://github.com/daily-co/daily-js
// Definitions by: Paul Kompfner <https://github.com/kompfner>

/**
 * --- BROWSER-SPECIFIC SECTION ---
 */

/// <reference lib="dom" />

/**
 * --- SECTION DUPLICATED WITH REACT-NATIVE-DAILY-JS ---
 */

export type Language = "de" | "en" | "fi" | "fr" | "nl" | "pt";

export type Event =
  | "loading"
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

export type MeetingState =
  | "new"
  | "loading"
  | "loaded"
  | "joining-meeting"
  | "joined-meeting"
  | "left-meeting"
  | "error";

export interface BrowserInfo {
  supported: boolean;
  mobile: boolean;
  name: string;
  version: string;
  supportsScreenShare: boolean;
  supportsSfu: boolean;
}

export interface FrameProps {
  url?: string;
  token?: string;
  lang?: Language;
  showLeaveButton?: boolean;
  showFullscreenButton?: boolean;
  iframeStyle?: object;
  customLayout?: boolean;
  cssFile?: string;
  cssText?: string;
  dailyConfig?: object;
  subscribeToTracksAutomatically?: boolean;
  videoSource?: string | MediaStreamTrack;
  audioSource?: string | MediaStreamTrack;
}

export interface Participant {
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
  cam_info: {} | VideoElementInfo;
  screen_info: {} | VideoElementInfo;
}

export interface ParticipantUpdates {
  setAudio?: boolean;
  setVideo?: boolean;
  eject?: true;
  styles?: ParticipantCss;
}

export interface ParticipantCss {
  cam?: ParticipantStreamCss;
  screen?: ParticipantStreamCss;
}

export interface ParticipantStreamCss {
  div?: object;
  overlay?: object;
  video?: object;
}

export interface VideoElementInfo {
  width: number;
  height: number;
  left: number;
  top: number;
  video_width: number;
  video_height: number;
}

export interface DeviceInfos {
  camera: {} | MediaDeviceInfo;
  mic: {} | MediaDeviceInfo;
  speaker: {} | MediaDeviceInfo;
}

export interface ScreenCaptureOptions {
  audio?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  chromeMediaSourceId?: string;
  mediaStream?: MediaStream;
}

export interface NetworkStats {
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

export interface RoomInfo {
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
    lang?: "" | Language;
    signaling_impl?: string;
    geo?: string;
  };
  dialInPIN?: string;
}

export interface EventObject {
  action: string;
  [payloadProp: string]: any;
}

export interface FaceInfo {
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
  createCallObject(properties?: FrameProps): DailyCall;
  wrap(iframe: HTMLIFrameElement, properties?: FrameProps): DailyCall;
  createFrame(parentElement: HTMLElement, properties?: FrameProps): DailyCall;
  createFrame(properties?: FrameProps): DailyCall;
  createTransparentFrame(properties?: FrameProps): DailyCall;
}

export interface DailyCallStaticUtils {
  supportedBrowser(): BrowserInfo;
}

export interface DailyCall {
  iframe(): HTMLIFrameElement | null;
  join(properties?: FrameProps): Promise<Participant[] | void>;
  leave(): Promise<void>;
  destroy(): Promise<void>;
  meetingState(): MeetingState;
  participants(): {
    local: Participant;
    [id: string]: Participant;
  };
  updateParticipant(sessionId: string, updates: ParticipantUpdates): DailyCall;
  updateParticipants(updates: {
    [sessionId: string]: ParticipantUpdates;
  }): DailyCall;
  localAudio(): boolean;
  localVideo(): boolean;
  setLocalAudio(enabled: boolean): DailyCall;
  setLocalVideo(enabled: boolean): DailyCall;
  setBandwidth(bw: {
    kbs?: number | "NO_CAP" | null;
    trackConstraints?: MediaTrackConstraints;
  }): DailyCall;
  setDailyLang(lang: Language): DailyCall;
  startCamera(properties?: FrameProps): Promise<DeviceInfos>;
  cycleCamera(): Promise<{ device?: MediaDeviceInfo | null }>;
  cycleMic(): Promise<{ device?: MediaDeviceInfo | null }>;
  setInputDevices(devices: {
    audioDeviceId?: string;
    audioSource?: MediaStreamTrack;
    videoDeviceId?: string;
    videoSource?: MediaStreamTrack;
  }): DailyCall;
  setOutputDevice(audioDevice: { id?: string }): DailyCall;
  getInputDevices(): Promise<DeviceInfos>;
  load(properties: FrameProps): Promise<void>;
  startScreenShare(captureOptions?: ScreenCaptureOptions): void;
  stopScreenShare(): void;
  startRecording(): void;
  stopRecording(): void;
  getNetworkStats(): Promise<NetworkStats>;
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
    faces?: { [id: string]: FaceInfo[] };
  }>;
  requestFullscreen(): Promise<void>;
  exitFullscreen(): void;
  room(): Promise<RoomInfo | null>;
  geo(): Promise<{ current: string }>;
  setNetworkTopology(options: {
    topology: "sfu" | "peer";
  }): Promise<{ workerId?: string; error?: string }>;
  setPlayNewParticipantSound(sound: boolean | number): void;
  on(event: Event, handler: (event?: EventObject) => void): DailyCall;
  once(event: Event, handler: (event?: EventObject) => void): DailyCall;
  off(event: Event, handler: (event?: EventObject) => void): DailyCall;
}

declare const DailyIframe: DailyCallFactory & DailyCallStaticUtils;

export default DailyIframe;
