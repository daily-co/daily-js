// This is a work-in-progress and incomplete, and not yet exposed through
// package.json. Use at your own risk!

// Type definitions for daily-js 0.0.987
// Project: https://github.com/daily-co/daily-js
// Definitions by: Paul Kompfner <https://github.com/kompfner>

// Declares that global variable `DailyIframe` is provided outside a module loader environment.
export as namespace DailyIframe;

// Declares that the class DailyIframe is the thing exported from the module.
export = DailyIframe;

// Declares class methods and properties.
declare class DailyIframe {
  // Static methods
  static supportedBrowser(): DailyIframe.BrowserInfo;
  static createCallObject(properties?: DailyIframe.FrameProps): DailyIframe;
  static wrap(
    iframe: HTMLIFrameElement,
    properties?: DailyIframe.FrameProps
  ): DailyIframe;
  static createFrame(
    parentElement: HTMLElement,
    properties?: DailyIframe.FrameProps
  ): DailyIframe;
  static createFrame(properties?: DailyIframe.FrameProps): DailyIframe;
  static createTransparentFrame(
    properties?: DailyIframe.FrameProps
  ): DailyIframe;

  // Instance methods
  iframe(): HTMLIFrameElement | null;
  join(
    properties?: DailyIframe.FrameProps
  ): Promise<DailyIframe.Participant[] | void>;
  leave(): Promise<void>;
  destroy(): Promise<void>;
  meetingState(): DailyIframe.MeetingState;
  participants(): {
    local: DailyIframe.Participant;
    [id: string]: DailyIframe.Participant;
  };
  updateParticipant(
    sessionId: string,
    updates: DailyIframe.ParticipantUpdates
  ): DailyIframe;
  updateParticipants(updates: {
    [sessionId: string]: DailyIframe.ParticipantUpdates;
  }): DailyIframe;
  localAudio(): boolean;
  localVideo(): boolean;
  setLocalAudio(enabled: boolean): DailyIframe;
  setLocalVideo(enabled: boolean): DailyIframe;
  setBandwidth(bw: {
    kbs?: number | 'NO_CAP' | null;
    trackConstraints?: MediaTrackConstraints;
  }): DailyIframe;
  setDailyLang(lang: DailyIframe.Language): DailyIframe;
  startCamera(
    properties?: DailyIframe.FrameProps
  ): Promise<DailyIframe.DeviceInfos>;
  cycleCamera(): Promise<{ device?: MediaDeviceInfo | null }>;
  cycleMic(): Promise<{ device?: MediaDeviceInfo | null }>;
  setInputDevices(devices: {
    audioDeviceId?: string;
    audioSource?: MediaStreamTrack;
    videoDeviceId?: string;
    videoSource?: MediaStreamTrack;
  }): DailyIframe;
  setOutputDevice(audioDevice: { id?: string }): DailyIframe;
  getInputDevices(): Promise<DailyIframe.DeviceInfos>;
  load(properties: DailyIframe.FrameProps): Promise<void>;
  startScreenShare(captureOptions?: DailyIframe.ScreenCaptureOptions): void;
  stopScreenShare(): void;
  startRecording(): void;
  stopRecording(): void;
  getNetworkStats(): Promise<DailyIframe.NetworkStats>;
  getActiveSpeaker(): { peerId?: string };
  setActiveSpeakerMode(enabled: boolean): DailyIframe;
  activeSpeakerMode(): boolean;
  subscribeToTracksAutomatically(): boolean;
  setSubscribeToTracksAutomatically(enabled: boolean): DailyIframe;
  enumerateDevices(): Promise<{ devices: MediaDeviceInfo[] }>;
  sendAppMessage(data: any, to?: string): DailyIframe;
  addFakeParticipant(details?: { aspectRatio: number }): DailyIframe;
  setShowNamesMode(mode: false | 'always' | 'never'): DailyIframe;
  requestFullscreen(): Promise<void>;
  exitFullscreen(): void;
  room(): Promise<DailyIframe.RoomInfo | null>;
  on(event: DailyIframe.Event, handler: (event?: any) => void): DailyIframe; // TODO: flesh out handler
  once(event: DailyIframe.Event, handler: (event?: any) => void): DailyIframe; // TODO: flesh out handler
  off(event: DailyIframe.Event, handler: (event?: any) => void): DailyIframe; // TODO: flesh out handler
}

// Declares supporting types under the `DailyIframe` namespace.
declare namespace DailyIframe {
  interface BrowserInfo {
    supported: boolean;
    mobile: boolean;
    name: string;
    version: string;
    supportsScreenShare: boolean;
    supportsSfu: boolean;
  }

  interface FrameProps {
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

  interface Participant {
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

  interface ParticipantUpdates {
    setAudio?: boolean;
    setVideo?: boolean;
    eject?: true;
    styles?: ParticipantCss;
  }

  interface ParticipantCss {
    cam?: ParticipantStreamCss;
    screen?: ParticipantStreamCss;
  }

  interface ParticipantStreamCss {
    div?: object;
    overlay?: object;
    video?: object;
  }

  interface VideoElementInfo {
    width: number;
    height: number;
    left: number;
    top: number;
    video_width: number;
    video_height: number;
  }

  interface DeviceInfos {
    camera: {} | MediaDeviceInfo;
    mic: {} | MediaDeviceInfo;
    speaker: {} | MediaDeviceInfo;
  }

  interface ScreenCaptureOptions {
    audio?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    chromeMediaSourceId?: string;
    mediaStream?: MediaStream;
  }

  interface NetworkStats {
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

  interface RoomInfo {
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
      lang?: '' | Language;
      signaling_impl?: string;
      geo?: string;
    };
    dialInPIN?: string;
  }

  type MeetingState =
    | 'new'
    | 'loading'
    | 'loaded'
    | 'joining-meeting'
    | 'joined-meeting'
    | 'left-meeting'
    | 'error';

  type Event =
    | 'loading'
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
    | 'app-message'
    | 'input-event'
    | 'local-screen-share-started'
    | 'local-screen-share-stopped'
    | 'active-speaker-change'
    | 'active-speaker-mode-change'
    | 'network-quality-change'
    | 'network-connection'
    | 'fullscreen'
    | 'exited-fullscreen'
    | 'error';

  type Language = 'de' | 'en' | 'fi' | 'fr' | 'nl' | 'pt';
}
