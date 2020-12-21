import EventEmitter from 'events';
import { deepEqual } from 'fast-equals';

import {
  // re-export
  //
  DAILY_STATE_NEW,
  DAILY_STATE_LOADING,
  DAILY_STATE_LOADED,
  DAILY_STATE_JOINING,
  DAILY_STATE_JOINED,
  DAILY_STATE_LEFT,
  DAILY_STATE_ERROR,
  DAILY_TRACK_STATE_BLOCKED,
  DAILY_TRACK_STATE_OFF,
  DAILY_TRACK_STATE_SENDABLE,
  DAILY_TRACK_STATE_LOADING,
  DAILY_TRACK_STATE_INTERRUPTED,
  DAILY_TRACK_STATE_PLAYABLE,
  DAILY_EVENT_LOADING,
  DAILY_EVENT_LOADED,
  DAILY_EVENT_STARTED_CAMERA,
  DAILY_EVENT_CAMERA_ERROR,
  DAILY_EVENT_JOINING_MEETING,
  DAILY_EVENT_JOINED_MEETING,
  DAILY_EVENT_LEFT_MEETING,
  DAILY_EVENT_PARTICIPANT_JOINED,
  DAILY_EVENT_PARTICIPANT_UPDATED,
  DAILY_EVENT_PARTICIPANT_LEFT,
  DAILY_EVENT_TRACK_STARTED,
  DAILY_EVENT_TRACK_STOPPED,
  DAILY_EVENT_RECORDING_STARTED,
  DAILY_EVENT_RECORDING_STOPPED,
  DAILY_EVENT_RECORDING_STATS,
  DAILY_EVENT_RECORDING_ERROR,
  DAILY_EVENT_RECORDING_UPLOAD_COMPLETED,
  DAILY_EVENT_ERROR,
  DAILY_EVENT_APP_MSG,
  DAILY_EVENT_INPUT_EVENT,
  DAILY_EVENT_LOCAL_SCREEN_SHARE_STARTED,
  DAILY_EVENT_LOCAL_SCREEN_SHARE_STOPPED,
  DAILY_EVENT_NETWORK_QUALITY_CHANGE,
  DAILY_EVENT_ACTIVE_SPEAKER_CHANGE,
  DAILY_EVENT_ACTIVE_SPEAKER_MODE_CHANGE,
  DAILY_EVENT_FULLSCREEN,
  DAILY_EVENT_EXIT_FULLSCREEN,
  DAILY_EVENT_NETWORK_CONNECTION,
  DAILY_EVENT_RECORDING_DATA,
  DAILY_EVENT_LIVE_STREAMING_STARTED,
  DAILY_EVENT_LIVE_STREAMING_STOPPED,
  DAILY_EVENT_LIVE_STREAMING_ERROR,

  // internals
  //
  IFRAME_MESSAGE_MARKER,
  DAILY_METHOD_START_CAMERA,
  DAILY_METHOD_SET_INPUT_DEVICES,
  DAILY_METHOD_SET_OUTPUT_DEVICE,
  DAILY_METHOD_GET_INPUT_DEVICES,
  DAILY_METHOD_JOIN,
  DAILY_METHOD_LEAVE,
  DAILY_METHOD_UPDATE_PARTICIPANT,
  DAILY_METHOD_LOCAL_AUDIO,
  DAILY_METHOD_LOCAL_VIDEO,
  DAILY_METHOD_START_SCREENSHARE,
  DAILY_METHOD_STOP_SCREENSHARE,
  DAILY_METHOD_START_RECORDING,
  DAILY_METHOD_STOP_RECORDING,
  DAILY_METHOD_LOAD_CSS,
  DAILY_METHOD_SET_BANDWIDTH,
  DAILY_METHOD_GET_CALC_STATS,
  DAILY_METHOD_ENUMERATE_DEVICES,
  DAILY_METHOD_CYCLE_CAMERA,
  DAILY_METHOD_CYCLE_MIC,
  DAILY_METHOD_APP_MSG,
  DAILY_METHOD_ADD_FAKE_PARTICIPANT,
  DAILY_METHOD_SET_SHOW_NAMES,
  DAILY_METHOD_SET_SHOW_LOCAL_VIDEO,
  DAILY_METHOD_SET_SHOW_PARTICIPANTS_BAR,
  DAILY_METHOD_SET_ACTIVE_SPEAKER_MODE,
  DAILY_METHOD_SET_LANG,
  MAX_APP_MSG_SIZE,
  DAILY_METHOD_REGISTER_INPUT_HANDLER,
  DAILY_METHOD_DETECT_ALL_FACES,
  DAILY_METHOD_ROOM,
  DAILY_METHOD_SET_NETWORK_TOPOLOGY,
  DAILY_METHOD_SET_PLAY_DING,
  DAILY_METHOD_SET_SUBSCRIBE_TO_TRACKS_AUTOMATICALLY,
  DAILY_METHOD_START_LIVE_STREAMING,
  DAILY_METHOD_STOP_LIVE_STREAMING,
  DAILY_CUSTOM_TRACK,
  DAILY_UI_REQUEST_FULLSCREEN,
  DAILY_UI_EXIT_FULLSCREEN,
  DAILY_EVENT_LOAD_ATTEMPT_FAILED,
  DAILY_METHOD_GET_CAMERA_FACING_MODE,
  DAILY_METHOD_SET_USER_NAME,
} from './shared-with-pluot-core/CommonIncludes.js';
import {
  isReactNative,
  browserInfo,
} from './shared-with-pluot-core/Environment.js';
import WebMessageChannel from './shared-with-pluot-core/script-message-channels/WebMessageChannel';
import ReactNativeMessageChannel from './shared-with-pluot-core/script-message-channels/ReactNativeMessageChannel';
import CallObjectLoader from './CallObjectLoader';
import { getLocalIsSubscribedToTrack } from './shared-with-pluot-core/selectors';
import { callObjectBundleUrl } from './utils.js';
import * as Participant from './Participant';

export {
  DAILY_STATE_NEW,
  DAILY_STATE_JOINING,
  DAILY_STATE_JOINED,
  DAILY_STATE_LEFT,
  DAILY_STATE_ERROR,
  DAILY_TRACK_STATE_BLOCKED,
  DAILY_TRACK_STATE_OFF,
  DAILY_TRACK_STATE_SENDABLE,
  DAILY_TRACK_STATE_LOADING,
  DAILY_TRACK_STATE_INTERRUPTED,
  DAILY_TRACK_STATE_PLAYABLE,
  DAILY_EVENT_JOINING_MEETING,
  DAILY_EVENT_JOINED_MEETING,
  DAILY_EVENT_LEFT_MEETING,
};

// Audio modes for React Native: whether we should configure audio for video
// calls or audio calls (i.e. whether we should use speakerphone).
const NATIVE_AUDIO_MODE_VIDEO_CALL = 'video';
const NATIVE_AUDIO_MODE_VOICE_CALL = 'voice';
const NATIVE_AUDIO_MODE_IDLE = 'idle';

//
//
//

const reactNativeConfigType = {
  androidInCallNotification: {
    title: 'string',
    subtitle: 'string',
    iconName: 'string',
    disableForCustomOverride: 'boolean',
  },
  disableAutoDeviceManagement: {
    audio: 'boolean',
    video: 'boolean',
  },
};

const FRAME_PROPS = {
  url: {
    validate: (url) => typeof url === 'string',
    help: 'url should be a string',
  },
  baseUrl: {
    validate: (url) => typeof url === 'string',
    help: 'baseUrl should be a string',
  },
  token: {
    validate: (token) => typeof token === 'string',
    help: 'token should be a string',
    queryString: 't',
  },
  dailyConfig: {
    // only for call object mode, for now
    validate: (config) => {
      if (!window._dailyConfig) {
        window._dailyConfig = {};
      }
      window._dailyConfig.experimentalGetUserMediaConstraintsModify =
        config.experimentalGetUserMediaConstraintsModify;
      delete config.experimentalGetUserMediaConstraintsModify;
      return true;
    },
  },
  reactNativeConfig: {
    validate: validateReactNativeConfig,
    help: `reactNativeConfig should look like ${JSON.stringify(
      reactNativeConfigType
    )}, all fields optional`,
  },
  lang: {
    validate: (lang) => {
      return [
        'de',
        'en-us',
        'en',
        'es',
        'fi',
        'fr',
        'it',
        'jp',
        'ka',
        'nl',
        'pl',
        'pt',
        'sv',
        'tr',
      ].includes(lang);
    },
    help:
      'language not supported. Options are: de, en-us, en, es, fi, fr, it, jp, ka, nl, pl, pt, sv, tr',
  },
  userName: true, // ignored if there's a token
  showLeaveButton: true,
  showLocalVideo: true,
  showParticipantsBar: true,
  showFullscreenButton: true,
  // style to apply to iframe in createFrame factory method
  iframeStyle: true,
  // styles passed through to video calls inside the iframe
  customLayout: true,
  cssFile: true,
  cssText: true,
  bodyClass: true,
  videoSource: {
    validate: (s, callObject) => {
      callObject._preloadCache.videoDeviceId = s;
      return true;
    },
  },
  audioSource: {
    validate: (s, callObject) => {
      callObject._preloadCache.audioDeviceId = s;
      return true;
    },
  },
  subscribeToTracksAutomatically: {
    validate: (s, callObject) => {
      callObject._preloadCache.subscribeToTracksAutomatically = s;
      return true;
    },
  },
  // used internally
  layout: {
    validate: (layout) =>
      layout === 'custom-v1' || layout === 'browser' || layout === 'none',
    help: 'layout may only be set to "custom-v1"',
    queryString: 'layout',
  },
  emb: {
    queryString: 'emb',
  },
  embHref: {
    queryString: 'embHref',
  },
  dailyJsVersion: {
    queryString: 'dailyJsVersion',
  },
};

// todo: more validation?
const PARTICIPANT_PROPS = {
  styles: {
    validate: (styles) => {
      for (var k in styles) {
        if (k !== 'cam' && k !== 'screen') {
          return false;
        }
      }
      if (styles.cam) {
        for (var k in styles.cam) {
          if (k !== 'div' && k !== 'video') {
            return false;
          }
        }
      }
      if (styles.screen) {
        for (var k in styles.screen) {
          if (k !== 'div' && k !== 'video') {
            return false;
          }
        }
      }
      return true;
    },
    help:
      'styles format should be a subset of: ' +
      '{ cam: {div: {}, video: {}}, screen: {div: {}, video: {}} }',
  },
  setSubscribedTracks: {
    validate: (subs, callObject, participant) => {
      if (callObject._preloadCache.subscribeToTracksAutomatically) {
        return false;
      }
      let validPrimitiveValues = [true, false];
      !isReactNative() && validPrimitiveValues.push('avatar');
      if (validPrimitiveValues.includes(subs)) {
        return true;
      }
      for (const s in subs) {
        if (
          !(
            s === 'audio' ||
            s === 'video' ||
            s === 'screenVideo' ||
            s === 'screenAudio'
          )
        ) {
          return false;
        }
      }
      return true;
    },
    help:
      'setSubscribedTracks cannot be used when setSubscribeToTracksAutomatically is enabled, and should be of the form: ' +
      `true${
        !isReactNative() ? " | 'avatar'" : ''
      } | false | { [audio: true|false], [video: true|false], [screenVideo: true|false] }`,
  },
  setAudio: true,
  setVideo: true,
  eject: true,
};

//
//
//

export default class DailyIframe extends EventEmitter {
  //
  // static methods
  //

  static supportedBrowser() {
    return browserInfo();
  }

  static version() {
    return __dailyJsVersion__;
  }

  //
  // constructors
  //

  static createCallObject(properties = {}) {
    properties.layout = 'none';
    return new DailyIframe(null, properties);
  }

  static wrap(iframeish, properties = {}) {
    methodNotSupportedInReactNative();
    if (
      !iframeish ||
      !iframeish.contentWindow ||
      'string' !== typeof iframeish.src
    ) {
      throw new Error('DailyIframe::Wrap needs an iframe-like first argument');
    }
    if (!properties.layout) {
      if (properties.customLayout) {
        properties.layout = 'custom-v1';
      } else {
        properties.layout = 'browser';
      }
    }
    return new DailyIframe(iframeish, properties);
  }

  static createFrame(arg1, arg2) {
    methodNotSupportedInReactNative();
    let parentEl, properties;
    if (arg1 && arg2) {
      parentEl = arg1;
      properties = arg2;
    } else if (arg1 && arg1.append) {
      parentEl = arg1;
      properties = {};
    } else {
      parentEl = document.body;
      properties = arg1 || {};
    }
    let iframeStyle = properties.iframeStyle;
    if (!iframeStyle) {
      if (parentEl === document.body) {
        iframeStyle = {
          position: 'fixed',
          border: '1px solid black',
          backgroundColor: 'white',
          width: '375px',
          height: '450px',
          right: '1em',
          bottom: '1em',
        };
      } else {
        iframeStyle = {
          border: 0,
          width: '100%',
          height: '100%',
        };
      }
    }

    let iframeEl = document.createElement('iframe');
    // special-case for old Electron for Figma
    if (window.navigator && window.navigator.userAgent.match(/Chrome\/61\./)) {
      iframeEl.allow = 'microphone, camera';
    } else {
      iframeEl.allow = 'microphone; camera; autoplay; display-capture';
    }
    iframeEl.style.visibility = 'hidden';
    parentEl.appendChild(iframeEl);
    iframeEl.style.visibility = null;
    Object.keys(iframeStyle).forEach(
      (k) => (iframeEl.style[k] = iframeStyle[k])
    );
    if (!properties.layout) {
      if (properties.customLayout) {
        properties.layout = 'custom-v1';
      } else {
        properties.layout = 'browser';
      }
    }
    try {
      let callFrame = new DailyIframe(iframeEl, properties);
      return callFrame;
    } catch (e) {
      // something when wrong while constructing the object. so let's clean
      // up by removing ourselves from the page, then rethrow the error.
      parentEl.removeChild(iframeEl);
      throw e;
    }
  }

  static createTransparentFrame(properties = {}) {
    methodNotSupportedInReactNative();
    let iframeEl = document.createElement('iframe');
    iframeEl.allow = 'microphone; camera; autoplay';
    iframeEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
      pointer-events: none;
    `;
    document.body.appendChild(iframeEl);
    if (!properties.layout) {
      properties.layout = 'custom-v1';
    }
    return DailyIframe.wrap(iframeEl, properties);
  }

  constructor(iframeish, properties = {}) {
    super();
    properties.dailyJsVersion = __dailyJsVersion__;
    this._iframe = iframeish;
    this._callObjectMode = properties.layout === 'none' && !this._iframe;
    this._preloadCache = initializePreloadCache();
    if (this._callObjectMode) {
      window._dailyPreloadCache = this._preloadCache;
    }

    if (properties.showLocalVideo !== undefined) {
      if (this._callObjectMode) {
        console.error('showLocalVideo is not available in callObject mode');
      } else {
        this._showLocalVideo = !!properties.showLocalVideo;
      }
    } else {
      this._showLocalVideo = true;
    }

    if (properties.showParticipantsBar !== undefined) {
      if (this._callObjectMode) {
        console.error(
          'showParticipantsBar is not available in callObject mode'
        );
      } else {
        this._showParticipantsBar = !!properties.showParticipantsBar;
      }
    } else {
      this._showParticipantsBar = true;
    }

    this.validateProperties(properties);
    this.properties = { ...properties };
    this._callObjectLoader = this._callObjectMode
      ? new CallObjectLoader()
      : null;
    this._meetingState = DAILY_STATE_NEW; // only update via updateIsPreparingToJoin() or updateMeetingState()
    this._isPreparingToJoin = false; // only update via updateMeetingState()
    this._nativeInCallAudioMode = NATIVE_AUDIO_MODE_VIDEO_CALL;
    this._participants = {};
    this._inputEventsOn = {}; // need to cache these until loaded
    this._network = { threshold: 'good', quality: 100 };
    this._activeSpeaker = {};
    this._activeSpeakerMode = false;
    this._callFrameId = Date.now() + Math.random().toString();
    this._messageChannel = isReactNative()
      ? new ReactNativeMessageChannel()
      : new WebMessageChannel();

    // fullscreen event listener
    if (this._iframe) {
      if (this._iframe.requestFullscreen) {
        // chrome (not safari)
        this._iframe.addEventListener('fullscreenchange', (e) => {
          if (document.fullscreenElement === this._iframe) {
            this.emit(DAILY_EVENT_FULLSCREEN);
            this.sendMessageToCallMachine({ action: DAILY_EVENT_FULLSCREEN });
          } else {
            this.emit(DAILY_EVENT_EXIT_FULLSCREEN);
            this.sendMessageToCallMachine({
              action: DAILY_EVENT_EXIT_FULLSCREEN,
            });
          }
        });
      } else if (this._iframe.webkitRequestFullscreen) {
        // safari
        this._iframe.addEventListener('webkitfullscreenchange', (e) => {
          if (document.webkitFullscreenElement === this._iframe) {
            this.emit(DAILY_EVENT_FULLSCREEN);
            this.sendMessageToCallMachine({ action: DAILY_EVENT_FULLSCREEN });
          } else {
            this.emit(DAILY_EVENT_EXIT_FULLSCREEN);
            this.sendMessageToCallMachine({
              action: DAILY_EVENT_EXIT_FULLSCREEN,
            });
          }
        });
      }
    }

    // add native event listeners
    if (isReactNative()) {
      const nativeUtils = this.nativeUtils();
      if (
        !(
          nativeUtils.addAudioFocusChangeListener &&
          nativeUtils.removeAudioFocusChangeListener &&
          nativeUtils.addAppActiveStateChangeListener &&
          nativeUtils.removeAppActiveStateChangeListener
        )
      ) {
        console.warn(
          'expected (add|remove)(AudioFocus|AppActiveState)ChangeListener to be available in React Native'
        );
      }
      // audio focus event, used for auto-muting mic
      this._hasNativeAudioFocus = true;
      nativeUtils.addAudioFocusChangeListener(
        this.handleNativeAudioFocusChange
      );
      // app active state event, used for auto-muting cam
      nativeUtils.addAppActiveStateChangeListener(
        this.handleNativeAppActiveStateChange
      );
    }

    this._messageChannel.addListenerForMessagesFromCallMachine(
      this.handleMessageFromCallMachine,
      this._callFrameId,
      this
    );
  }

  //
  // instance methods
  //

  async destroy() {
    try {
      if (
        [DAILY_STATE_JOINED, DAILY_STATE_LOADING].includes(this._meetingState)
      ) {
        await this.leave();
      }
    } catch (e) {}
    let iframe = this._iframe;
    if (iframe) {
      let parent = iframe.parentElement;
      if (parent) {
        parent.removeChild(iframe);
      }
    }
    this._messageChannel.removeListener(this.handleMessageFromCallMachine);

    // tear down native event listeners
    if (isReactNative()) {
      const nativeUtils = this.nativeUtils();
      nativeUtils.removeAudioFocusChangeListener(
        this.handleNativeAudioFocusChange
      );
      nativeUtils.removeAppActiveStateChangeListener(
        this.handleNativeAppActiveStateChange
      );
    }
  }

  loadCss({ bodyClass, cssFile, cssText }) {
    methodNotSupportedInReactNative();
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_LOAD_CSS,
      cssFile: this.absoluteUrl(cssFile),
      bodyClass,
      cssText,
    });
    return this;
  }

  iframe() {
    methodNotSupportedInReactNative();
    return this._iframe;
  }

  meetingState() {
    return this._meetingState;
  }

  participants() {
    return this._participants;
  }

  updateParticipant(sessionId, properties) {
    if (
      this._participants.local &&
      this._participants.local.session_id === sessionId
    ) {
      sessionId = 'local';
    }
    if (sessionId && properties && this._participants[sessionId]) {
      for (var prop in properties) {
        if (!PARTICIPANT_PROPS[prop]) {
          throw new Error(`unrecognized updateParticipant property ${prop}`);
        }
        if (PARTICIPANT_PROPS[prop].validate) {
          if (
            !PARTICIPANT_PROPS[prop].validate(
              properties[prop],
              this,
              this._participants[sessionId]
            )
          ) {
            throw new Error(PARTICIPANT_PROPS[prop].help);
          }
        }
      }
      this.sendMessageToCallMachine({
        action: DAILY_METHOD_UPDATE_PARTICIPANT,
        id: sessionId,
        properties,
      });
    }
    return this;
  }

  updateParticipants(properties) {
    for (var sessionId in properties) {
      this.updateParticipant(sessionId, properties[sessionId]);
    }
    return this;
  }

  localAudio() {
    if (this._participants.local) {
      return this._participants.local.audio;
    }
    return null;
  }

  localVideo() {
    if (this._participants.local) {
      return this._participants.local.video;
    }
    return null;
  }

  setLocalAudio(bool) {
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_LOCAL_AUDIO,
      state: bool,
    });
    return this;
  }

  setLocalVideo(bool) {
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_LOCAL_VIDEO,
      state: bool,
    });
    return this;
  }

  setBandwidth({ kbs, trackConstraints }) {
    methodNotSupportedInReactNative();
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_SET_BANDWIDTH,
      kbs,
      trackConstraints,
    });
    return this;
  }

  setDailyLang(lang) {
    methodNotSupportedInReactNative();
    this.sendMessageToCallMachine({ action: DAILY_METHOD_SET_LANG, lang });
    return this;
  }

  setUserName(name, options) {
    methodNotSupportedInReactNative();
    return new Promise(async (resolve) => {
      const k = (msg) => {
        delete msg.action;
        delete msg.callbackStamp;
        resolve(msg);
      };
      this.sendMessageToCallMachine(
        {
          action: DAILY_METHOD_SET_USER_NAME,
          name: name ?? '',
          thisMeetingOnly: options ? !!options.thisMeetingOnly : false,
        },
        k
      );
    });
  }

  startCamera(properties = {}) {
    return new Promise(async (resolve, reject) => {
      let k = (msg) => {
        delete msg.action;
        delete msg.callbackStamp;
        resolve(msg);
      };
      if (this.needsLoad()) {
        try {
          await this.load(properties);
        } catch (e) {
          reject(e);
        }
      }
      this.sendMessageToCallMachine(
        {
          action: DAILY_METHOD_START_CAMERA,
          properties: makeSafeForPostMessage(this.properties),
        },
        k
      );
    });
  }

  cycleCamera() {
    return new Promise((resolve, _) => {
      let k = (msg) => {
        resolve({ device: msg.device });
      };
      this.sendMessageToCallMachine({ action: DAILY_METHOD_CYCLE_CAMERA }, k);
    });
  }

  cycleMic() {
    methodNotSupportedInReactNative();
    return new Promise((resolve, _) => {
      let k = (msg) => {
        resolve({ device: msg.device });
      };
      this.sendMessageToCallMachine({ action: DAILY_METHOD_CYCLE_MIC }, k);
    });
  }

  getCameraFacingMode() {
    methodOnlySupportedInReactNative();
    return new Promise((resolve, _) => {
      let k = (msg) => {
        resolve(msg.facingMode);
      };
      this.sendMessageToCallMachine(
        { action: DAILY_METHOD_GET_CAMERA_FACING_MODE },
        k
      );
    });
  }

  setInputDevices({ audioDeviceId, videoDeviceId, audioSource, videoSource }) {
    console.warn(
      'setInputDevices() is deprecated: instead use setInputDevicesAsync(), which returns a Promise'
    );
    this.setInputDevicesAsync({
      audioDeviceId,
      videoDeviceId,
      audioSource,
      videoSource,
    });
    return this;
  }

  async setInputDevicesAsync({
    audioDeviceId,
    videoDeviceId,
    audioSource,
    videoSource,
  }) {
    methodNotSupportedInReactNative();
    // use audioDeviceId and videoDeviceId internally
    if (audioSource !== undefined) {
      audioDeviceId = audioSource;
    }
    if (videoSource !== undefined) {
      videoDeviceId = videoSource;
    }

    // cache these for use in subsequent calls
    if (audioDeviceId) {
      this._preloadCache.audioDeviceId = audioDeviceId;
    }
    if (videoDeviceId) {
      this._preloadCache.videoDeviceId = videoDeviceId;
    }

    // if we're in callObject mode and not joined yet, don't do anything
    if (this._callObjectMode && this._meetingState !== DAILY_STATE_JOINED) {
      return {
        camera: { deviceId: this._preloadCache.videoDeviceId },
        mic: { deviceId: this._preloadCache.audioDeviceId },
        speaker: { deviceId: this._preloadCache.outputDeviceId },
      };
    }

    if (audioDeviceId instanceof MediaStreamTrack) {
      audioDeviceId = DAILY_CUSTOM_TRACK;
    }
    if (videoDeviceId instanceof MediaStreamTrack) {
      videoDeviceId = DAILY_CUSTOM_TRACK;
    }

    return new Promise((resolve) => {
      let k = (msg) => {
        delete msg.action;
        delete msg.callbackStamp;
        resolve(msg);
      };
      this.sendMessageToCallMachine(
        {
          action: DAILY_METHOD_SET_INPUT_DEVICES,
          audioDeviceId,
          videoDeviceId,
        },
        k
      );
    });
  }

  setOutputDevice({ outputDeviceId }) {
    methodNotSupportedInReactNative();
    // cache this for use later
    if (outputDeviceId) {
      this._preloadCache.outputDeviceId = outputDeviceId;
    }

    // if we're in callObject mode and not joined yet, don't do anything
    if (this._callObjectMode && this._meetingState !== DAILY_STATE_JOINED) {
      return this;
    }

    this.sendMessageToCallMachine({
      action: DAILY_METHOD_SET_OUTPUT_DEVICE,
      outputDeviceId,
    });
    return this;
  }

  async getInputDevices() {
    methodNotSupportedInReactNative();
    if (this._callObjectMode && this._meetingState !== DAILY_STATE_JOINED) {
      return {
        camera: { deviceId: this._preloadCache.videoDeviceId },
        mic: { deviceId: this._preloadCache.audioDeviceId },
        speaker: { deviceId: this._preloadCache.outputDeviceId },
      };
    }

    return new Promise((resolve, reject) => {
      let k = (msg) => {
        delete msg.action;
        delete msg.callbackStamp;
        resolve(msg);
      };
      this.sendMessageToCallMachine(
        { action: DAILY_METHOD_GET_INPUT_DEVICES },
        k
      );
    });
  }

  nativeInCallAudioMode() {
    methodOnlySupportedInReactNative();
    return this._nativeInCallAudioMode;
  }

  setNativeInCallAudioMode(inCallAudioMode) {
    methodOnlySupportedInReactNative();
    if (
      ![NATIVE_AUDIO_MODE_VIDEO_CALL, NATIVE_AUDIO_MODE_VOICE_CALL].includes(
        inCallAudioMode
      )
    ) {
      console.error('invalid in-call audio mode specified: ', inCallAudioMode);
      return;
    }

    if (inCallAudioMode === this._nativeInCallAudioMode) {
      return;
    }

    // Set new audio mode (video call, audio call) to use when we're in a call
    this._nativeInCallAudioMode = inCallAudioMode;

    // If we're in a call now, apply the new audio mode
    // (assuming automatic audio device management isn't disabled)
    if (
      !this.disableReactNativeAutoDeviceManagement('audio') &&
      this.shouldDeviceUseInCallAudioMode(this._meetingState)
    ) {
      this.nativeUtils().setAudioMode(this._nativeInCallAudioMode);
    }

    return this;
  }

  async load(properties) {
    if (!this.needsLoad()) {
      return;
    }

    if (properties) {
      this.validateProperties(properties);
      this.properties = { ...this.properties, ...properties };
    }

    // In iframe mode, we *must* have a meeting url
    // (As opposed to call object mode, where a meeting url, a base url, or no
    // url at all are all valid here)
    if (!this._callObjectMode && !this.properties.url) {
      throw new Error(
        "can't load iframe meeting because url property isn't set"
      );
    }

    this.updateMeetingState(DAILY_STATE_LOADING);
    try {
      this.emit(DAILY_EVENT_LOADING, { action: DAILY_EVENT_LOADING });
    } catch (e) {
      console.log("could not emit 'loading'");
    }

    if (this._callObjectMode) {
      // non-iframe, callObjectMode
      return new Promise((resolve, reject) => {
        this._callObjectLoader.cancel();
        this._callObjectLoader.load(
          this.properties.url || this.properties.baseUrl,
          this._callFrameId,
          (wasNoOp) => {
            this.updateMeetingState(DAILY_STATE_LOADED);
            // Only need to emit event if load was a no-op, since the loaded
            // bundle won't be emitting it if it's not executed again
            wasNoOp &&
              this.emit(DAILY_EVENT_LOADED, { action: DAILY_EVENT_LOADED });
            resolve();
          },
          (errorMsg, willRetry) => {
            this.emit(DAILY_EVENT_LOAD_ATTEMPT_FAILED, {
              action: DAILY_EVENT_LOAD_ATTEMPT_FAILED,
              errorMsg,
            });
            if (!willRetry) {
              this.updateMeetingState(DAILY_STATE_ERROR);
              this.emit(DAILY_EVENT_ERROR, {
                action: DAILY_EVENT_ERROR,
                errorMsg,
              });
              reject(errorMsg);
            }
          }
        );
      });
    } else {
      // iframe
      this._iframe.src = this.assembleMeetingUrl();
      return new Promise((resolve, reject) => {
        this._loadedCallback = (error) => {
          if (this._meetingState === DAILY_STATE_ERROR) {
            reject(error);
            return;
          }
          this.updateMeetingState(DAILY_STATE_LOADED);
          if (this.properties.cssFile || this.properties.cssText) {
            this.loadCss(this.properties);
          }
          for (let eventName in this._inputEventsOn) {
            this.sendMessageToCallMachine({
              action: DAILY_METHOD_REGISTER_INPUT_HANDLER,
              on: eventName,
            });
          }
          resolve();
        };
      });
    }
  }

  async join(properties = {}) {
    let newCss = false;
    if (this.needsLoad()) {
      this.updateIsPreparingToJoin(true);
      try {
        await this.load(properties);
      } catch (e) {
        this.updateIsPreparingToJoin(false);
        return Promise.reject(e);
      }
    } else {
      newCss = !!(this.properties.cssFile || this.properties.cssText);

      // Validate that url we're using to join() doesn't conflict with the url
      // we used to load()
      if (properties.url) {
        if (this._callObjectMode) {
          const newBundleUrl = callObjectBundleUrl(properties.url);
          const loadedBundleUrl = callObjectBundleUrl(
            this.properties.url || this.properties.baseUrl
          );
          if (newBundleUrl !== loadedBundleUrl) {
            console.error(
              `error: in call object mode, can't change the daily.co call url after load() to one with a different bundle url (${loadedBundleUrl} -> ${newBundleUrl})`
            );
            this.updateIsPreparingToJoin(false);
            return Promise.reject();
          }
          this.properties.url = properties.url;
        } else {
          // iframe mode
          if (properties.url && properties.url !== this.properties.url) {
            console.error(
              `error: in iframe mode, can't change the daily.co call url after load() (${this.properties.url} -> ${properties.url})`
            );
            this.updateIsPreparingToJoin(false);
            return Promise.reject();
          }
        }
      }

      // Validate and assign properties to this.properties, for use by call
      // machine
      this.validateProperties(properties);
      this.properties = { ...this.properties, ...properties };
    }

    // only update if showLocalVideo/showParticipantsBar are being explicitly set
    if (properties.showLocalVideo !== undefined) {
      if (this._callObjectMode) {
        console.error('showLocalVideo is not available in callObject mode');
      } else {
        this._showLocalVideo = !!properties.showLocalVideo;
      }
    }
    if (properties.showParticipantsBar !== undefined) {
      if (this._callObjectMode) {
        console.error(
          'showParticipantsBar is not available in callObject mode'
        );
      } else {
        this._showParticipantsBar = !!properties.showParticipantsBar;
      }
    }

    if (
      this._meetingState === DAILY_STATE_JOINED ||
      this._meetingState === DAILY_STATE_JOINING
    ) {
      console.warn('already joined meeting, call leave() before joining again');
      this.updateIsPreparingToJoin(false);
      return;
    }
    this.updateMeetingState(DAILY_STATE_JOINING, false);
    try {
      this.emit(DAILY_EVENT_JOINING_MEETING, {
        action: DAILY_EVENT_JOINING_MEETING,
      });
    } catch (e) {
      console.log("could not emit 'joining-meeting'");
    }
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_JOIN,
      properties: makeSafeForPostMessage(this.properties),
      preloadCache: makeSafeForPostMessage(this._preloadCache),
    });
    return new Promise((resolve, reject) => {
      this._joinedCallback = (participants, error) => {
        if (this._meetingState === DAILY_STATE_ERROR) {
          reject(error);
          return;
        }
        this.updateMeetingState(DAILY_STATE_JOINED);
        if (participants) {
          for (var id in participants) {
            this._callObjectMode &&
              Participant.addTracks(participants[id], this._participants[id]);
            this._participants[id] = { ...participants[id] };
            this.toggleParticipantAudioBasedOnNativeAudioFocus();
          }
        }
        if (newCss) {
          this.loadCss(this.properties);
        }
        resolve(participants);
      };
    });
  }

  async leave() {
    return new Promise((resolve, _) => {
      let k = () => {
        if (this._iframe) {
          // resetting the iframe src maybe interferes with sending the
          // ks beacon?
          // this._iframe.src = '';
        }
        this.updateMeetingState(DAILY_STATE_LEFT);
        this._participants = {};
        this._activeSpeakerMode = false;
        resetPreloadCache(this._preloadCache);
        try {
          this.emit(DAILY_STATE_LEFT, { action: DAILY_STATE_LEFT });
        } catch (e) {
          console.log("could not emit 'left-meeting'");
        }
        resolve();
      };
      if (this._callObjectLoader && !this._callObjectLoader.loaded) {
        // If call object bundle never successfully loaded, cancel load if
        // needed and clean up state immediately (without waiting for call
        // machine to clean up its state).
        this._callObjectLoader.cancel();
        k();
      } else if (
        this._meetingState === DAILY_STATE_LEFT ||
        this._meetingState === DAILY_STATE_ERROR
      ) {
        // nothing to do, here, just resolve
        resolve();
      } else {
        // TODO: the possibility that the iframe call machine is not yet loaded
        // is never handled here...
        this.sendMessageToCallMachine({ action: DAILY_METHOD_LEAVE }, k);
      }
    });
  }

  startScreenShare(captureOptions = {}) {
    methodNotSupportedInReactNative();
    if (captureOptions.mediaStream) {
      this._preloadCache.screenMediaStream = captureOptions.mediaStream;
      captureOptions.mediaStream = DAILY_CUSTOM_TRACK;
    }
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_START_SCREENSHARE,
      captureOptions,
    });
  }

  stopScreenShare() {
    methodNotSupportedInReactNative();
    this.sendMessageToCallMachine({ action: DAILY_METHOD_STOP_SCREENSHARE });
  }

  startRecording() {
    methodNotSupportedInReactNative();
    this.sendMessageToCallMachine({ action: DAILY_METHOD_START_RECORDING });
  }

  stopRecording() {
    methodNotSupportedInReactNative();
    this.sendMessageToCallMachine({ action: DAILY_METHOD_STOP_RECORDING });
  }

  startLiveStreaming({
    rtmpUrl,
    width = 1920,
    height = 1080,
    backgroundColor = '0xff000000',
  }) {
    methodNotSupportedInReactNative();
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_START_LIVE_STREAMING,
      rtmpUrl,
      width,
      height,
      backgroundColor,
    });
  }

  stopLiveStreaming() {
    methodNotSupportedInReactNative();
    this.sendMessageToCallMachine({ action: DAILY_METHOD_STOP_LIVE_STREAMING });
  }

  getNetworkStats() {
    if (this._meetingState !== DAILY_STATE_JOINED) {
      let stats = { latest: {} };
      return { stats };
    }
    return new Promise((resolve, _) => {
      let k = (msg) => {
        resolve({ stats: msg.stats, ...this._network });
      };
      this.sendMessageToCallMachine({ action: DAILY_METHOD_GET_CALC_STATS }, k);
    });
  }

  getActiveSpeaker() {
    methodNotSupportedInReactNative();
    return this._activeSpeaker;
  }

  setActiveSpeakerMode(enabled) {
    methodNotSupportedInReactNative();
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_SET_ACTIVE_SPEAKER_MODE,
      enabled,
    });
    return this;
  }

  activeSpeakerMode() {
    methodNotSupportedInReactNative();
    return this._activeSpeakerMode;
  }

  subscribeToTracksAutomatically() {
    return this._preloadCache.subscribeToTracksAutomatically;
  }

  setSubscribeToTracksAutomatically(enabled) {
    if (this._meetingState !== DAILY_STATE_JOINED) {
      throw new Error(
        'setSubscribeToTracksAutomatically() is only allowed while in a meeting'
      );
    }
    this._preloadCache.subscribeToTracksAutomatically = enabled;
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_SET_SUBSCRIBE_TO_TRACKS_AUTOMATICALLY,
      enabled,
    });
    return this;
  }

  async enumerateDevices() {
    methodNotSupportedInReactNative();
    if (this._callObjectMode) {
      let raw = await navigator.mediaDevices.enumerateDevices();
      return { devices: raw.map((d) => JSON.parse(JSON.stringify(d))) };
    }

    return new Promise((resolve, _) => {
      let k = (msg) => {
        resolve({ devices: msg.devices });
      };
      this.sendMessageToCallMachine(
        { action: DAILY_METHOD_ENUMERATE_DEVICES },
        k
      );
    });
  }

  sendAppMessage(data, to = '*') {
    if (JSON.stringify(data).length > MAX_APP_MSG_SIZE) {
      throw new Error(
        'Message data too large. Max size is ' + MAX_APP_MSG_SIZE
      );
    }
    this.sendMessageToCallMachine({ action: DAILY_METHOD_APP_MSG, data, to });
    return this;
  }

  addFakeParticipant(args) {
    methodNotSupportedInReactNative();
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_ADD_FAKE_PARTICIPANT,
      ...args,
    });
    return this;
  }

  setShowNamesMode(mode) {
    methodNotSupportedInReactNative();
    if (mode && !(mode === 'always' || mode === 'never')) {
      console.error(
        'setShowNamesMode argument should be "always", "never", or false'
      );
      return this;
    }
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_SET_SHOW_NAMES,
      mode: mode,
    });
    return this;
  }

  setShowLocalVideo(show = true) {
    methodNotSupportedInReactNative();
    if (typeof show !== 'boolean') {
      console.error('setShowLocalVideo only accepts a boolean value');
      return this;
    }
    if (this._callObjectMode) {
      console.error('setShowLocalVideo is not available in callObject mode');
      return this;
    }
    if (this._meetingState !== DAILY_STATE_JOINED) {
      console.error(
        'the meeting must be joined before calling setShowLocalVideo'
      );
      return this;
    }
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_SET_SHOW_LOCAL_VIDEO,
      show,
    });
    this._showLocalVideo = show;
    return this;
  }

  showLocalVideo() {
    methodNotSupportedInReactNative();
    if (this._callObjectMode) {
      console.error('showLocalVideo is not available in callObject mode');
      return this;
    }
    return this._showLocalVideo;
  }

  setShowParticipantsBar(show = true) {
    methodNotSupportedInReactNative();
    if (typeof show !== 'boolean') {
      console.error('setShowParticipantsBar only accepts a boolean value');
      return this;
    }
    if (this._callObjectMode) {
      console.error(
        'setShowParticipantsBar is not available in callObject mode'
      );
      return this;
    }
    if (this._meetingState !== DAILY_STATE_JOINED) {
      console.error(
        'the meeting must be joined before calling setShowParticipantsBar'
      );
      return this;
    }
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_SET_SHOW_PARTICIPANTS_BAR,
      show,
    });
    this._showParticipantsBar = show;
    return this;
  }

  showParticipantsBar() {
    methodNotSupportedInReactNative();
    if (this._callObjectMode) {
      console.error('showParticipantsBar is not available in callObject mode');
      return this;
    }
    return this._showParticipantsBar;
  }

  detectAllFaces() {
    methodNotSupportedInReactNative();
    return new Promise((resolve, _) => {
      let k = (msg) => {
        delete msg.action;
        delete msg.callbackStamp;
        resolve(msg);
      };
      this.sendMessageToCallMachine(
        { action: DAILY_METHOD_DETECT_ALL_FACES },
        k
      );
    });
  }

  async requestFullscreen() {
    methodNotSupportedInReactNative();
    if (!this._iframe || document.fullscreenElement) {
      return;
    }
    try {
      (await this._iframe.requestFullscreen)
        ? this._iframe.requestFullscreen()
        : this._iframe.webkitRequestFullscreen();
    } catch (e) {
      console.log('could not make video call fullscreen', e);
    }
  }

  exitFullscreen() {
    methodNotSupportedInReactNative();
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (document.webkitFullscreenElement) {
      document.webkitExitFullscreen();
    }
  }

  async room() {
    if (this._meetingState !== DAILY_STATE_JOINED) {
      // Return the URL of the room we'd be in if we succesfully join()ed.
      // Note that this doesn't mean you're necessarily in the process of
      // joining; you might be waiting for join() to be called.
      if (this.properties.url) {
        return { roomUrlPendingJoin: this.properties.url };
      }
      return null;
    }
    return new Promise((resolve, _) => {
      let k = (msg) => {
        delete msg.action;
        delete msg.callbackStamp;
        resolve(msg);
      };
      this.sendMessageToCallMachine({ action: DAILY_METHOD_ROOM }, k);
    });
  }

  async geo() {
    return new Promise(async (resolve, _) => {
      try {
        let url = 'https://gs.daily.co/_ks_/x-swsl/:';
        let res = await fetch(url);
        let data = await res.json();
        resolve({ current: data.geo });
      } catch (e) {
        console.error('geo lookup failed', e);
        resolve({ current: '' });
      }
    });
  }

  async setNetworkTopology(opts) {
    methodNotSupportedInReactNative();
    return new Promise(async (resolve, reject) => {
      let k = (msg) => {
        if (msg.error) {
          reject({ error: msg.error });
        } else {
          resolve({ workerId: msg.workerId });
        }
      };
      this.sendMessageToCallMachine(
        { action: DAILY_METHOD_SET_NETWORK_TOPOLOGY, opts },
        k
      );
    });
  }

  setPlayNewParticipantSound(arg) {
    methodNotSupportedInReactNative();
    if (!(typeof arg === 'number' || arg === true || arg === false)) {
      throw new Error(
        `argument to setShouldPlayNewParticipantSound should be true, false, or a number, but is ${arg}`
      );
    }
    this.sendMessageToCallMachine({ action: DAILY_METHOD_SET_PLAY_DING, arg });
  }

  on(eventName, k) {
    this._inputEventsOn[eventName] = {};
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_REGISTER_INPUT_HANDLER,
      on: eventName,
    });
    return EventEmitter.prototype.on.call(this, eventName, k);
  }

  // todo: once is almost certainly implemented incorrectly. read the
  // EventEmitter source to figure out how to do this properly. since
  // overriding on/off/once are optimizations, anyway, we won't worry
  // about it right now.
  once(eventName, k) {
    this._inputEventsOn[eventName] = {};
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_REGISTER_INPUT_HANDLER,
      on: eventName,
    });
    return EventEmitter.prototype.once.call(this, eventName, k);
  }

  off(eventName, k) {
    delete this._inputEventsOn[eventName];
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_REGISTER_INPUT_HANDLER,
      off: eventName,
    });
    return EventEmitter.prototype.off.call(this, eventName, k);
  }

  //
  // internal methods
  //

  validateProperties(properties) {
    for (var k in properties) {
      if (!FRAME_PROPS[k]) {
        throw new Error(`unrecognized property '${k}'`);
      }
      if (
        FRAME_PROPS[k].validate &&
        !FRAME_PROPS[k].validate(properties[k], this)
      ) {
        throw new Error(`property '${k}': ${FRAME_PROPS[k].help}`);
      }
    }
  }

  assembleMeetingUrl() {
    // handle case of url with query string and without
    let props = {
        ...this.properties,
        emb: this._callFrameId,
        embHref: encodeURIComponent(window.location.href),
      },
      firstSep = props.url.match(/\?/) ? '&' : '?',
      url = props.url,
      urlProps = Object.keys(FRAME_PROPS).filter(
        (p) => FRAME_PROPS[p].queryString && props[p] !== undefined
      );
    let newQueryString = urlProps
      .map((p) => `${FRAME_PROPS[p].queryString}=${props[p]}`)
      .join('&');
    return url + firstSep + newQueryString;
  }

  // Note that even if the below method returns true, load() may decide that
  // there's nothing more to do (e.g. in the case that the call object has
  // already been loaded once) and simply carry out the appropriate meeting
  // state transition.
  needsLoad() {
    // NOTE: The *only* reason DAILY_STATE_LOADING is here is to preserve a bug
    // that I (@kompfner) am a bit hesitant to fix until more time can be
    // dedicated to doing the *right* fix. If we're in DAILY_STATE_LOADING, we
    // probably *shouldn't* let you trigger another load() and get into a weird
    // state, but this has been long-standing behavior. The alternative would mean
    // that, if load() failed silently for some reason, you couldn't re-trigger it
    // since we'd be stuck in the DAILY_STATE_LOADING state.
    return [
      DAILY_STATE_NEW,
      DAILY_STATE_LOADING,
      DAILY_STATE_LEFT,
      DAILY_STATE_ERROR,
    ].includes(this._meetingState);
  }

  sendMessageToCallMachine(message, callback) {
    this._messageChannel.sendMessageToCallMachine(
      message,
      callback,
      this._iframe,
      this._callFrameId
    );
  }

  handleMessageFromCallMachine(msg) {
    switch (msg.action) {
      case DAILY_EVENT_LOADED:
        if (this._loadedCallback) {
          this._loadedCallback();
          this._loadedCallback = null;
        }
        try {
          this.emit(msg.action, msg);
        } catch (e) {
          console.log('could not emit', msg);
        }
        break;
      case DAILY_EVENT_JOINED_MEETING:
        if (this._joinedCallback) {
          this._joinedCallback(msg.participants);
          this._joinedCallback = null;
        }
        try {
          this.emit(msg.action, msg);
        } catch (e) {
          console.log('could not emit', msg);
        }
        break;
      case DAILY_EVENT_PARTICIPANT_JOINED:
      case DAILY_EVENT_PARTICIPANT_UPDATED:
        if (this._meetingState === DAILY_STATE_LEFT) {
          return;
        }
        if (msg.participant && msg.participant.session_id) {
          let id = msg.participant.local ? 'local' : msg.participant.session_id;
          this._callObjectMode &&
            Participant.addTracks(msg.participant, this._participants[id]);
          // track events
          try {
            this.maybeEventTrackStopped(
              this._participants[id],
              msg.participant,
              'audioTrack'
            );
            this.maybeEventTrackStopped(
              this._participants[id],
              msg.participant,
              'videoTrack'
            );
            this.maybeEventTrackStopped(
              this._participants[id],
              msg.participant,
              'screenVideoTrack'
            );
            this.maybeEventTrackStopped(
              this._participants[id],
              msg.participant,
              'screenAudioTrack'
            );
            this.maybeEventTrackStarted(
              this._participants[id],
              msg.participant,
              'audioTrack'
            );
            this.maybeEventTrackStarted(
              this._participants[id],
              msg.participant,
              'videoTrack'
            );
            this.maybeEventTrackStarted(
              this._participants[id],
              msg.participant,
              'screenVideoTrack'
            );
            this.maybeEventTrackStarted(
              this._participants[id],
              msg.participant,
              'screenAudioTrack'
            );
          } catch (e) {
            console.error('track events error', e);
          }
          // participant joined/updated events
          if (
            !this.compareEqualForParticipantUpdateEvent(
              msg.participant,
              this._participants[id]
            )
          ) {
            this._participants[id] = { ...msg.participant };
            this.toggleParticipantAudioBasedOnNativeAudioFocus();
            try {
              this.emit(msg.action, msg);
            } catch (e) {
              console.log('could not emit', msg);
            }
          }
        }
        break;
      case DAILY_EVENT_PARTICIPANT_LEFT:
        if (msg.participant && msg.participant.session_id) {
          // track events
          let prevP = this._participants[msg.participant.session_id];
          if (prevP) {
            this.maybeEventTrackStopped(prevP, null, 'audioTrack');
            this.maybeEventTrackStopped(prevP, null, 'videoTrack');
            this.maybeEventTrackStopped(prevP, null, 'screenVideoTrack');
            this.maybeEventTrackStopped(prevP, null, 'screenAudioTrack');
          }
          // delete from local cach
          delete this._participants[msg.participant.session_id];
          try {
            this.emit(msg.action, msg);
          } catch (e) {
            console.log('could not emit', msg);
          }
        }
        break;
      case DAILY_EVENT_ERROR:
        if (this._iframe) {
          this._iframe.src = '';
        }
        this.updateMeetingState(DAILY_STATE_ERROR);
        this._participants = {};
        if (this._loadedCallback) {
          this._loadedCallback(msg.errorMsg);
          this._loadedCallback = null;
        }
        if (this._joinedCallback) {
          this._joinedCallback(null, msg.errorMsg);
          this._joinedCallback = null;
        }
        try {
          this.emit(msg.action, msg);
        } catch (e) {
          console.log('could not emit', msg);
        }
        break;
      case DAILY_EVENT_LEFT_MEETING:
        if (this._meetingState !== DAILY_STATE_ERROR) {
          this.updateMeetingState(DAILY_STATE_LEFT);
        }
        try {
          this.emit(msg.action, msg);
        } catch (e) {
          console.log('could not emit', msg);
        }
        break;
      case DAILY_EVENT_INPUT_EVENT:
        let p = this._participants[msg.session_id];
        if (!p) {
          if (msg.session_id === this._participants.local.session_id) {
            p = this._participants.local;
          } else {
            p = {};
          }
        }
        try {
          this.emit(msg.event.type, {
            action: msg.event.type,
            event: msg.event,
            participant: { ...p },
          });
        } catch (e) {
          console.log('could not emit', msg);
        }
        break;
      case DAILY_EVENT_NETWORK_QUALITY_CHANGE:
        let { threshold, quality } = msg;
        if (
          threshold !== this._network.threshold ||
          quality !== this._network.quality
        ) {
          this._network.quality = quality;
          this._network.threshold = threshold;
          try {
            this.emit(msg.action, msg);
          } catch (e) {
            console.log('could not emit', msg);
          }
        }
        break;
      case DAILY_EVENT_ACTIVE_SPEAKER_CHANGE:
        let { activeSpeaker } = msg;
        if (this._activeSpeaker.peerId !== activeSpeaker.peerId) {
          this._activeSpeaker.peerId = activeSpeaker.peerId;
          try {
            this.emit(msg.action, {
              action: msg.action,
              activeSpeaker: this._activeSpeaker,
            });
          } catch (e) {
            console.log('could not emit', msg);
          }
        }
        break;
      case DAILY_EVENT_ACTIVE_SPEAKER_MODE_CHANGE:
        const { enabled } = msg;
        if (this._activeSpeakerMode !== enabled) {
          this._activeSpeakerMode = enabled;
          try {
            this.emit(msg.action, {
              action: msg.action,
              enabled: this._activeSpeakerMode,
            });
          } catch (e) {
            console.log('could not emit', msg);
          }
        }
        break;
      case DAILY_EVENT_RECORDING_STARTED:
      case DAILY_EVENT_RECORDING_STOPPED:
      case DAILY_EVENT_RECORDING_STATS:
      case DAILY_EVENT_RECORDING_ERROR:
      case DAILY_EVENT_RECORDING_UPLOAD_COMPLETED:
      case DAILY_EVENT_STARTED_CAMERA:
      case DAILY_EVENT_CAMERA_ERROR:
      case DAILY_EVENT_APP_MSG:
      case DAILY_EVENT_LOCAL_SCREEN_SHARE_STARTED:
      case DAILY_EVENT_LOCAL_SCREEN_SHARE_STOPPED:
      case DAILY_EVENT_NETWORK_CONNECTION:
      case DAILY_EVENT_RECORDING_DATA:
      case DAILY_EVENT_LIVE_STREAMING_STARTED:
      case DAILY_EVENT_LIVE_STREAMING_STOPPED:
      case DAILY_EVENT_LIVE_STREAMING_ERROR:
        try {
          this.emit(msg.action, msg);
        } catch (e) {
          console.log('could not emit', msg, e);
        }
        break;
      case DAILY_UI_REQUEST_FULLSCREEN:
        this.requestFullscreen();
        break;
      case DAILY_UI_EXIT_FULLSCREEN:
        this.exitFullscreen();
        break;
      default: // no op
    }
  }

  maybeEventTrackStopped(prevP, thisP, key) {
    if (!prevP) {
      return;
    }
    if (
      (prevP[key] && prevP[key].readyState === 'ended') ||
      (prevP[key] && !(thisP && thisP[key])) ||
      (prevP[key] && prevP[key].id !== thisP[key].id)
    ) {
      try {
        this.emit(DAILY_EVENT_TRACK_STOPPED, {
          action: DAILY_EVENT_TRACK_STOPPED,
          track: prevP[key],
          participant: thisP,
        });
      } catch (e) {
        console.log('could not emit', e);
      }
    }
  }

  maybeEventTrackStarted(prevP, thisP, key) {
    if (
      (thisP[key] && !(prevP && prevP[key])) ||
      (thisP[key] && prevP[key].readyState === 'ended') ||
      (thisP[key] && thisP[key].id !== prevP[key].id)
    ) {
      try {
        this.emit(DAILY_EVENT_TRACK_STARTED, {
          action: DAILY_EVENT_TRACK_STARTED,
          track: thisP[key],
          participant: thisP,
        });
      } catch (e) {
        console.log('could not emit', e);
      }
    }
  }

  compareEqualForParticipantUpdateEvent(a, b) {
    if (!deepEqual(a, b)) {
      return false;
    }
    if (
      a.videoTrack &&
      b.videoTrack &&
      (a.videoTrack.id !== b.videoTrack.id ||
        a.videoTrack.muted !== b.videoTrack.muted ||
        a.videoTrack.enabled !== b.videoTrack.enabled)
    ) {
      return false;
    }
    if (
      a.audioTrack &&
      b.audioTrack &&
      (a.audioTrack.id !== b.audioTrack.id ||
        a.audioTrack.muted !== b.audioTrack.muted ||
        a.audioTrack.enabled !== b.audioTrack.enabled)
    ) {
      return false;
    }
    return true;
  }

  nativeUtils() {
    if (!isReactNative()) {
      return null;
    }
    if (typeof DailyNativeUtils === 'undefined') {
      console.warn(
        'in React Native, DailyNativeUtils is expected to be available'
      );
      return null;
    }
    return DailyNativeUtils;
  }

  updateIsPreparingToJoin(isPreparingToJoin) {
    this.updateMeetingState(this._meetingState, isPreparingToJoin);
  }

  updateMeetingState(
    meetingState,
    isPreparingToJoin = this._isPreparingToJoin
  ) {
    // If state hasn't changed, bail
    if (
      meetingState === this._meetingState &&
      isPreparingToJoin === this._isPreparingToJoin
    ) {
      return;
    }

    // Update state
    const oldMeetingState = this._meetingState;
    const oldIsPreparingToJoin = this._isPreparingToJoin;
    this._meetingState = meetingState;
    this._isPreparingToJoin = isPreparingToJoin;

    // Update state side-effects (which, for now, all depend on whether
    // isMeetingPendingOrOngoing)
    const oldIsMeetingPendingOrOngoing = this.isMeetingPendingOrOngoing(
      oldMeetingState,
      oldIsPreparingToJoin
    );
    const isMeetingPendingOrOngoing = this.isMeetingPendingOrOngoing(
      this._meetingState,
      this._isPreparingToJoin
    );
    if (oldIsMeetingPendingOrOngoing === isMeetingPendingOrOngoing) {
      return;
    }
    this.updateKeepDeviceAwake(isMeetingPendingOrOngoing);
    this.updateDeviceAudioMode(isMeetingPendingOrOngoing);
    this.updateShowAndroidOngoingMeetingNotification(isMeetingPendingOrOngoing);
    this.updateNoOpRecordingEnsuringBackgroundContinuity(
      isMeetingPendingOrOngoing
    );
  }

  updateKeepDeviceAwake(keepAwake) {
    if (!isReactNative()) {
      return;
    }
    this.nativeUtils().setKeepDeviceAwake(keepAwake, this._callFrameId);
  }

  updateDeviceAudioMode(useInCallAudioMode) {
    if (
      !isReactNative() ||
      this.disableReactNativeAutoDeviceManagement('audio')
    ) {
      return;
    }
    const inCallAudioMode = useInCallAudioMode
      ? this._nativeInCallAudioMode
      : NATIVE_AUDIO_MODE_IDLE;
    this.nativeUtils().setAudioMode(inCallAudioMode);
  }

  // Note: notification properties can't be changed while it is ongoing
  updateShowAndroidOngoingMeetingNotification(showNotification) {
    // Check that we're React Native and that the Android-only method exists
    if (
      !(isReactNative() && this.nativeUtils().setShowOngoingMeetingNotification)
    ) {
      return;
    }
    // Use current this.properties to customize notification behavior
    let title, subtitle, iconName, disableForCustomOverride;
    if (
      this.properties.reactNativeConfig &&
      this.properties.reactNativeConfig.androidInCallNotification
    ) {
      ({
        title,
        subtitle,
        iconName,
        disableForCustomOverride,
      } = this.properties.reactNativeConfig.androidInCallNotification);
    }
    if (disableForCustomOverride) {
      showNotification = false;
    }
    this.nativeUtils().setShowOngoingMeetingNotification(
      showNotification,
      title,
      subtitle,
      iconName,
      this._callFrameId
    );
  }

  // Whether to enable no-op audio recording to ensure continuity of the app
  // when backgrounded. Required in iOS to ensure we can finish joining when the
  // app is backgrounded before gUM is called, and to ensure that signaling
  // remains connected when we're in an empty room and our own cam and mic are
  // off.
  updateNoOpRecordingEnsuringBackgroundContinuity(enableNoOpRecording) {
    if (
      !(
        isReactNative() &&
        this.nativeUtils().enableNoOpRecordingEnsuringBackgroundContinuity
      )
    ) {
      return;
    }
    this.nativeUtils().enableNoOpRecordingEnsuringBackgroundContinuity(
      enableNoOpRecording
    );
  }

  isMeetingPendingOrOngoing(meetingState, isPreparingToJoin) {
    return (
      [DAILY_STATE_JOINING, DAILY_STATE_JOINED].includes(meetingState) ||
      isPreparingToJoin
    );
  }

  handleNativeAppActiveStateChange = (isActive) => {
    // If automatic video device management is disabled, bail
    if (this.disableReactNativeAutoDeviceManagement('video')) {
      return;
    }
    if (isActive) {
      // If cam was unmuted before losing focus, unmute
      // (Note this is assumption is not perfect, since theoretically an app
      // could unmute while in the background, but it's decent for now)
      if (this.camUnmutedBeforeLosingNativeActiveState) {
        this.setLocalVideo(true);
      }
    } else {
      this.camUnmutedBeforeLosingNativeActiveState = this.localVideo();
      // Mute cam, but check first whether we have local video in the first
      // place: if we don't, we may still be in the gUM process, with the app
      // "inactive" simply because it's behind the permissions dialogs.
      if (this.camUnmutedBeforeLosingNativeActiveState) {
        this.setLocalVideo(false);
      }
    }
  };

  handleNativeAudioFocusChange = (hasFocus) => {
    // If automatic audio device management is disabled, bail
    if (this.disableReactNativeAutoDeviceManagement('audio')) {
      return;
    }
    this._hasNativeAudioFocus = hasFocus;
    // toggle participant audio if needed
    this.toggleParticipantAudioBasedOnNativeAudioFocus();
    // toggle mic mute if needed
    if (this._hasNativeAudioFocus) {
      // If mic was unmuted before losing focus, unmute
      // (Note this is assumption is not perfect, since theoretically an app
      // could unmute while in the background, but it's decent for now)
      if (this.micUnmutedBeforeLosingNativeAudioFocus) {
        this.setLocalAudio(true);
      }
    } else {
      this.micUnmutedBeforeLosingNativeAudioFocus = this.localAudio();
      this.setLocalAudio(false);
    }
  };

  toggleParticipantAudioBasedOnNativeAudioFocus() {
    if (!isReactNative()) {
      return;
    }
    // Need to access store directly since when participant muted their audio we
    // don't have access to their audio tracks in this._participants
    const state = store.getState();
    for (const streamId in state.streams) {
      const streamData = state.streams[streamId];
      if (
        streamData &&
        streamData.pendingTrack &&
        streamData.pendingTrack.kind === 'audio'
      ) {
        streamData.pendingTrack.enabled = this._hasNativeAudioFocus;
      }
    }
  }

  // type must be either 'audio' or 'video'
  disableReactNativeAutoDeviceManagement(type) {
    return (
      this.properties.reactNativeConfig &&
      this.properties.reactNativeConfig.disableAutoDeviceManagement &&
      this.properties.reactNativeConfig.disableAutoDeviceManagement[type]
    );
  }

  absoluteUrl(url) {
    if ('undefined' === typeof url) {
      return undefined;
    }
    let a = document.createElement('a');
    a.href = url;
    return a.href;
  }

  sayHello() {
    const str = 'hello, world.';
    console.log(str);
    return str;
  }
}

function initializePreloadCache(callObject, properties) {
  return {
    subscribeToTracksAutomatically: true,
    audioDeviceId: null,
    videoDeviceId: null,
    outputDeviceId: null,
  };
}

function resetPreloadCache(c) {
  // don't need to do anything, until we add stuff to the preload
  // cache that should not persist
}

function makeSafeForPostMessage(props) {
  const safe = {};
  for (let p in props) {
    if (props[p] instanceof MediaStreamTrack) {
      // note: could store the track in a global variable for accessing
      // on the other side of the postMessage, here, instead of as we
      // currently do in the validate-properties routines, which definitely
      // is a spooky-action-at-a-distance code anti-pattern
      safe[p] = DAILY_CUSTOM_TRACK;
    } else if (p === 'dailyConfig') {
      if (props[p].modifyLocalSdpHook) {
        if (window._dailyConfig) {
          window._dailyConfig.modifyLocalSdpHook = props[p].modifyLocalSdpHook;
        }
        delete props[p].modifyLocalSdpHook;
      }
      if (props[p].modifyRemoteSdpHook) {
        if (window._dailyConfig) {
          window._dailyConfig.modifyRemoteSdpHook =
            props[p].modifyRemoteSdpHook;
        }
        delete props[p].modifyRemoteSdpHook;
      }
      safe[p] = props[p];
    } else {
      safe[p] = props[p];
    }
  }
  return safe;
}

function methodNotSupportedInReactNative() {
  if (isReactNative()) {
    throw new Error(
      'This daily-js method is not currently supported in React Native'
    );
  }
}

function methodOnlySupportedInReactNative() {
  if (!isReactNative()) {
    throw new Error('This daily-js method is only supported in React Native');
  }
}

function validateReactNativeConfig(config) {
  return validateConfigPropType(config, reactNativeConfigType);
}

function validateConfigPropType(prop, propType) {
  if (propType === undefined) {
    return false;
  }
  switch (typeof propType) {
    case 'string':
      return typeof prop === propType;
    case 'object':
      if (typeof prop !== 'object') {
        return false;
      }
      for (const key in prop) {
        if (!validateConfigPropType(prop[key], propType[key])) {
          return false;
        }
      }
      return true;
    default:
      // console.error(
      //   "Internal programming error: we've defined our config prop types wrong"
      // );
      return false;
  }
}
