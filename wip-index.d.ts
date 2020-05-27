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
  static supportedBrowser(): DailyIframe.BrowserInfo;
  static createCallObject(properties?: DailyIframe.FrameProps): DailyIframe;
  join(
    properties?: DailyIframe.FrameProps
  ): Promise<DailyIframe.Participant[] | void>;
  leave(): Promise<void>;
  destroy(): Promise<void>;
  meetingState(): DailyIframe.MeetingState;
  participants(): { [id: string]: DailyIframe.Participant };
  setLocalAudio(enabled: boolean): DailyIframe;
  setLocalVideo(enabled: boolean): DailyIframe;
  startCamera(properties?: DailyIframe.FrameProps): Promise<any>; // TODO: flesh out return type
  on(event: DailyIframe.Event, handler: (event?: any) => void): DailyIframe; // TODO: flesh out handler
  once(event: DailyIframe.Event, handler: (event?: any) => void): DailyIframe; // TODO: flesh out handler
  off(event: DailyIframe.Event, handler: (event?: any) => void): DailyIframe; // TODO: flesh out handler
}

// Declares supporting types under the `DailyIframe` namespace.
declare namespace DailyIframe {
  type BrowserInfo = {
    supported: boolean;
    mobile: boolean;
    name: string;
    version: string;
    supportsScreenShare: boolean;
    supportsSfu: boolean;
  };

  type FrameProps = object; // TODO: flesh out

  type Participant = {
    audio: boolean;
    audioTrack?: any; // TODO: see if there's a way we can use MediaStreamTrack here that works with browser + RN...
    video: boolean;
    videoTrack?: any;
    screen: boolean;
    screenVideoTrack?: any;
  }; // TODO: flesh out

  type MeetingState =
    | "new"
    | "loading"
    | "loaded"
    | "joining-meeting"
    | "joined-meeting"
    | "left-meeting"
    | "error";

  type Event =
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
}
