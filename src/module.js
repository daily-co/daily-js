import EventEmitter from 'events';
import { deepEqual } from 'fast-equals';
import Bowser from 'bowser';

import {
  // re-export
  //
  // meeting states
  DAILY_STATE_NEW,
  DAILY_STATE_LOADING,
  DAILY_STATE_LOADED,
  DAILY_STATE_JOINING,
  DAILY_STATE_JOINED,
  DAILY_STATE_LEFT,
  DAILY_STATE_ERROR,
  // track states
  DAILY_TRACK_STATE_BLOCKED,
  DAILY_TRACK_STATE_OFF,
  DAILY_TRACK_STATE_SENDABLE,
  DAILY_TRACK_STATE_LOADING,
  DAILY_TRACK_STATE_INTERRUPTED,
  DAILY_TRACK_STATE_PLAYABLE,
  // meeting access
  DAILY_ACCESS_UNKNOWN,
  DAILY_ACCESS_LEVEL_FULL,
  DAILY_ACCESS_LEVEL_LOBBY,
  DAILY_ACCESS_LEVEL_NONE,
  // receive settings
  DAILY_RECEIVE_SETTINGS_BASE_KEY,
  DAILY_RECEIVE_SETTINGS_ALL_PARTICIPANTS_KEY,
  // error types
  DAILY_FATAL_ERROR_EJECTED,
  DAILY_FATAL_ERROR_NBF_ROOM,
  DAILY_FATAL_ERROR_NBF_TOKEN,
  DAILY_FATAL_ERROR_EXP_ROOM,
  DAILY_FATAL_ERROR_EXP_TOKEN,
  DAILY_CAMERA_ERROR_CAM_IN_USE,
  DAILY_CAMERA_ERROR_MIC_IN_USE,
  DAILY_CAMERA_ERROR_CAM_AND_MIC_IN_USE,
  // events
  DAILY_EVENT_IFRAME_READY_FOR_LAUNCH_CONFIG,
  DAILY_EVENT_IFRAME_LAUNCH_CONFIG,
  DAILY_EVENT_THEME_UPDATED,
  DAILY_EVENT_LOADING,
  DAILY_EVENT_LOADED,
  DAILY_EVENT_LOAD_ATTEMPT_FAILED,
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
  DAILY_EVENT_REMOTE_MEDIA_PLAYER_STARTED,
  DAILY_EVENT_REMOTE_MEDIA_PLAYER_UPDATED,
  DAILY_EVENT_REMOTE_MEDIA_PLAYER_STOPPED,
  DAILY_EVENT_TRANSCRIPTION_STARTED,
  DAILY_EVENT_TRANSCRIPTION_STOPPED,
  DAILY_EVENT_TRANSCRIPTION_ERROR,
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
  DAILY_EVENT_LANG_UPDATED,
  DAILY_EVENT_SHOW_LOCAL_VIDEO_CHANGED,
  DAILY_EVENT_ACCESS_STATE_UPDATED,
  DAILY_EVENT_MEETING_SESSION_UPDATED,
  DAILY_EVENT_WAITING_PARTICIPANT_ADDED,
  DAILY_EVENT_WAITING_PARTICIPANT_REMOVED,
  DAILY_EVENT_WAITING_PARTICIPANT_UPDATED,
  DAILY_EVENT_RECEIVE_SETTINGS_UPDATED,
  DAILY_EVENT_INPUT_SETTINGS_UPDATED,
  DAILY_EVENT_NONFATAL_ERROR,

  // internals
  //
  DAILY_METHOD_SET_THEME,
  DAILY_METHOD_START_CAMERA,
  DAILY_METHOD_SET_INPUT_DEVICES,
  DAILY_METHOD_SET_OUTPUT_DEVICE,
  DAILY_METHOD_GET_INPUT_DEVICES,
  DAILY_METHOD_JOIN,
  DAILY_METHOD_LEAVE,
  DAILY_METHOD_UPDATE_PARTICIPANT,
  DAILY_METHOD_UPDATE_PARTICIPANTS,
  DAILY_METHOD_LOCAL_AUDIO,
  DAILY_METHOD_LOCAL_VIDEO,
  DAILY_METHOD_START_SCREENSHARE,
  DAILY_METHOD_STOP_SCREENSHARE,
  DAILY_METHOD_START_RECORDING,
  DAILY_METHOD_UPDATE_RECORDING,
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
  DAILY_METHOD_GET_LANG,
  DAILY_METHOD_SET_LANG,
  DAILY_METHOD_GET_MEETING_SESSION,
  MAX_APP_MSG_SIZE,
  DAILY_METHOD_REGISTER_INPUT_HANDLER,
  DAILY_METHOD_DETECT_ALL_FACES,
  DAILY_METHOD_ROOM,
  DAILY_METHOD_GET_NETWORK_TOPOLOGY,
  DAILY_METHOD_SET_NETWORK_TOPOLOGY,
  DAILY_METHOD_SET_PLAY_DING,
  DAILY_METHOD_SET_SUBSCRIBE_TO_TRACKS_AUTOMATICALLY,
  DAILY_METHOD_START_LIVE_STREAMING,
  DAILY_METHOD_UPDATE_LIVE_STREAMING,
  DAILY_METHOD_STOP_LIVE_STREAMING,
  DAILY_METHOD_START_TRANSCRIPTION,
  DAILY_METHOD_STOP_TRANSCRIPTION,
  DAILY_CUSTOM_TRACK,
  DAILY_UI_REQUEST_FULLSCREEN,
  DAILY_UI_EXIT_FULLSCREEN,
  DAILY_METHOD_GET_CAMERA_FACING_MODE,
  DAILY_METHOD_SET_USER_NAME,
  DAILY_METHOD_PREAUTH,
  DAILY_METHOD_REQUEST_ACCESS,
  DAILY_METHOD_UPDATE_WAITING_PARTICIPANT,
  DAILY_METHOD_UPDATE_WAITING_PARTICIPANTS,
  DAILY_METHOD_GET_SINGLE_PARTICIPANT_RECEIVE_SETTINGS,
  DAILY_METHOD_UPDATE_RECEIVE_SETTINGS,
  DAILY_JS_VIDEO_PROCESSOR_TYPES as VIDEO_PROCESSOR_TYPES,
  DAILY_METHOD_UPDATE_INPUT_SETTINGS,
  DAILY_METHOD_START_REMOTE_MEDIA_PLAYER,
  DAILY_METHOD_STOP_REMOTE_MEDIA_PLAYER,
  DAILY_METHOD_UPDATE_REMOTE_MEDIA_PLAYER,
  DAILY_JS_REMOTE_MEDIA_PLAYER_SETTING,
  DAILY_JS_REMOTE_MEDIA_PLAYER_STATE,
  DAILY_PRESELECTED_BG_IMAGE_URLS_LENGTH,
  DAILY_SUPPORTED_BG_IMG_TYPES,
} from './shared-with-pluot-core/CommonIncludes.js';
import {
  isReactNative,
  browserVideoSupported_p,
  getUserAgent,
  isFullscreenSupported,
  isScreenSharingSupported,
  isSfuSupported,
  isVideoProcessingSupported,
} from './shared-with-pluot-core/Environment.js';
import WebMessageChannel from './shared-with-pluot-core/script-message-channels/WebMessageChannel';
import ReactNativeMessageChannel from './shared-with-pluot-core/script-message-channels/ReactNativeMessageChannel';
import CallObjectLoader from './CallObjectLoader';
import {
  callObjectBundleUrl,
  randomStringId,
  validateHttpUrl,
} from './utils.js';
import * as Participant from './Participant';

// meeting states
export {
  DAILY_STATE_NEW,
  DAILY_STATE_JOINING,
  DAILY_STATE_JOINED,
  DAILY_STATE_LEFT,
  DAILY_STATE_ERROR,
};

// track states
export {
  DAILY_TRACK_STATE_BLOCKED,
  DAILY_TRACK_STATE_OFF,
  DAILY_TRACK_STATE_SENDABLE,
  DAILY_TRACK_STATE_LOADING,
  DAILY_TRACK_STATE_INTERRUPTED,
  DAILY_TRACK_STATE_PLAYABLE,
};

// meeting access
export {
  DAILY_ACCESS_UNKNOWN,
  DAILY_ACCESS_LEVEL_FULL,
  DAILY_ACCESS_LEVEL_LOBBY,
  DAILY_ACCESS_LEVEL_NONE,
};

// receive settings
export {
  DAILY_RECEIVE_SETTINGS_BASE_KEY,
  DAILY_RECEIVE_SETTINGS_ALL_PARTICIPANTS_KEY,
};

// error types
export {
  DAILY_FATAL_ERROR_EJECTED,
  DAILY_FATAL_ERROR_NBF_ROOM,
  DAILY_FATAL_ERROR_NBF_TOKEN,
  DAILY_FATAL_ERROR_EXP_ROOM,
  DAILY_FATAL_ERROR_EXP_TOKEN,
  DAILY_CAMERA_ERROR_CAM_IN_USE,
  DAILY_CAMERA_ERROR_MIC_IN_USE,
  DAILY_CAMERA_ERROR_CAM_AND_MIC_IN_USE,
};

// events
export {
  DAILY_EVENT_IFRAME_READY_FOR_LAUNCH_CONFIG,
  DAILY_EVENT_IFRAME_LAUNCH_CONFIG,
  DAILY_EVENT_THEME_UPDATED,
  DAILY_EVENT_LOADING,
  DAILY_EVENT_LOADED,
  DAILY_EVENT_LOAD_ATTEMPT_FAILED,
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
  DAILY_EVENT_REMOTE_MEDIA_PLAYER_STARTED,
  DAILY_EVENT_REMOTE_MEDIA_PLAYER_UPDATED,
  DAILY_EVENT_REMOTE_MEDIA_PLAYER_STOPPED,
  DAILY_EVENT_TRANSCRIPTION_STARTED,
  DAILY_EVENT_TRANSCRIPTION_STOPPED,
  DAILY_EVENT_TRANSCRIPTION_ERROR,
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
  DAILY_EVENT_LANG_UPDATED,
  DAILY_EVENT_ACCESS_STATE_UPDATED,
  DAILY_EVENT_MEETING_SESSION_UPDATED,
  DAILY_EVENT_WAITING_PARTICIPANT_ADDED,
  DAILY_EVENT_WAITING_PARTICIPANT_REMOVED,
  DAILY_EVENT_WAITING_PARTICIPANT_UPDATED,
  DAILY_EVENT_RECEIVE_SETTINGS_UPDATED,
  DAILY_EVENT_INPUT_SETTINGS_UPDATED,
  DAILY_EVENT_NONFATAL_ERROR,
};

// Audio modes for React Native: whether we should configure audio for video
// calls or audio calls (i.e. whether we should use speakerphone).
const NATIVE_AUDIO_MODE_VIDEO_CALL = 'video';
const NATIVE_AUDIO_MODE_VOICE_CALL = 'voice';
const NATIVE_AUDIO_MODE_IDLE = 'idle';

const MAX_RMP_FPS = 30;
const MIN_RMP_FPS = 1;
const MAX_SIMULCAST_LAYERS = 3;
const MAX_SCALE_RESOLUTION_BY = 8;
const MAX_LAYER_BITRATE = 2500000;
const MIN_LAYER_BITRATE = 100000;

const simulcastEncodingsValidRanges = {
  maxBitrate: { min: MIN_LAYER_BITRATE, max: MAX_LAYER_BITRATE },
  maxFramerate: { min: MIN_RMP_FPS, max: MAX_RMP_FPS },
  scaleResolutionDownBy: { min: 1, max: MAX_SCALE_RESOLUTION_BY },
};

const startRmpSettingsValidKeys = ['state', 'simulcastEncodings'];
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
        'en-us', // Here for backwards compatibility, but not encouraged (just maps to 'en' anyway)
        'en',
        'es',
        'fi',
        'fr',
        'it',
        'jp',
        'ka',
        'nl',
        'no',
        'pl',
        'pt',
        'ru',
        'sv',
        'tr',
        'user',
      ].includes(lang);
    },
    help:
      'language not supported. Options are: de, en-us, en, es, fi, fr, it, jp, ka, nl, no, pl, pt, ru, sv, tr, user',
  },
  userName: true, // ignored if there's a token
  activeSpeakerMode: true,
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
  theme: {
    validate: (o) => {
      const validColors = [
        'accent',
        'accentText',
        'background',
        'backgroundAccent',
        'baseText',
        'border',
        'mainAreaBg',
        'mainAreaBgAccent',
        'mainAreaText',
        'supportiveText',
      ];
      const containsValidColors = (colors) => {
        for (const key of Object.keys(colors)) {
          if (!validColors.includes(key)) {
            // Key is not a supported theme color
            console.error(
              `unsupported color "${key}". Valid colors: ${validColors.join(
                ', '
              )}`
            );
            return false;
          }
          if (!colors[key].match(/^#[0-9a-f]{6}|#[0-9a-f]{3}$/i)) {
            // Color is not in hex format
            console.error(
              `${key} theme color should be provided in valid hex color format. Received: "${colors[key]}"`
            );
            return false;
          }
        }
        return true;
      };
      if (
        typeof o !== 'object' ||
        !(('light' in o && 'dark' in o) || 'colors' in o)
      ) {
        // Must define either both themes or colors
        console.error(
          'Theme must contain either both "light" and "dark" properties, or "colors".',
          o
        );
        return false;
      }
      if ('light' in o && 'dark' in o) {
        if (!('colors' in o.light)) {
          console.error('Light theme is missing "colors" property.', o);
          return false;
        }
        if (!('colors' in o.dark)) {
          console.error('Dark theme is missing "colors" property.', o);
          return false;
        }
        return (
          containsValidColors(o.light.colors) &&
          containsValidColors(o.dark.colors)
        );
      }
      return containsValidColors(o.colors);
    },
    help:
      'unsupported theme configuration. Check error logs for detailed info.',
  },
  layoutConfig: {
    validate: (layoutConfig) => {
      if ('grid' in layoutConfig) {
        const gridConfig = layoutConfig.grid;
        if ('maxTilesPerPage' in gridConfig) {
          if (!Number.isInteger(gridConfig.maxTilesPerPage)) {
            console.error(
              `grid.maxTilesPerPage should be an integer. You passed ${gridConfig.maxTilesPerPage}.`
            );
            return false;
          }
          if (gridConfig.maxTilesPerPage > 49) {
            console.error(
              `grid.maxTilesPerPage can't be larger than 49 without sacrificing browser performance. Please contact us at https://www.daily.co/contact to talk about your use case.`
            );
            return false;
          }
        }
        if ('minTilesPerPage' in gridConfig) {
          if (!Number.isInteger(gridConfig.minTilesPerPage)) {
            console.error(
              `grid.minTilesPerPage should be an integer. You passed ${gridConfig.minTilesPerPage}.`
            );
            return false;
          }
          if (gridConfig.minTilesPerPage < 1) {
            console.error(`grid.minTilesPerPage can't be lower than 1.`);
            return false;
          }
          if (
            'maxTilesPerPage' in gridConfig &&
            gridConfig.minTilesPerPage > gridConfig.maxTilesPerPage
          ) {
            console.error(
              `grid.minTilesPerPage can't be higher than grid.maxTilesPerPage.`
            );
            return false;
          }
        }
      }
      return true;
    },
    help: 'unsupported layoutConfig. Check error logs for detailed info.',
  },
  receiveSettings: {
    // Disallow "*" shorthand key since it's a shorthand for participants
    // currently connected *to you* (i.e. participants already in
    // participants()), which is necessarily empty at join time. Allowing this
    // key might only sow confusion: it might lead people to think it's a
    // shorthand for participants currently connected *to the room*.
    validate: (receiveSettings) =>
      validateReceiveSettings(receiveSettings, {
        allowAllParticipantsKey: false,
      }),
    help: receiveSettingsValidationHelpMsg({
      allowAllParticipantsKey: false,
    }),
  },
  inputSettings: {
    validate: (inputSettings) => validateInputSettings(inputSettings),
    help: inputSettingsValidationHelpMsg(),
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
      const validPrimitiveValues = [true, false, 'staged'];
      if (
        validPrimitiveValues.includes(subs) ||
        (!isReactNative() && subs === 'avatar')
      ) {
        return true;
      }
      for (const s in subs) {
        if (
          !(
            [
              'audio',
              'video',
              'screenAudio',
              'screenVideo',
              'rmpAudio',
              'rmpVideo',
            ].includes(s) && validPrimitiveValues.includes(subs[s])
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
      } | false | 'staged' | { [audio: true|false|'staged'], [video: true|false|'staged'], [screenAudio: true|false|'staged'], [screenVideo: true|false|'staged'] }`,
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
    if (isReactNative()) {
      return {
        supported: true,
        mobile: true,
        name: 'React Native',
        version: null,
        supportsScreenShare: false,
        supportsSfu: true,
        supportsVideoProcessing: false,
      };
    }
    const browser = Bowser.getParser(getUserAgent());
    return {
      supported: !!browserVideoSupported_p(),
      mobile: browser.getPlatformType() === 'mobile',
      name: browser.getBrowserName(),
      version: browser.getBrowserVersion(),
      supportsFullscreen: !!isFullscreenSupported(),
      supportsScreenShare: !!isScreenSharingSupported(),
      supportsSfu: !!isSfuSupported(),
      supportsVideoProcessing: isVideoProcessingSupported(),
    };
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
    properties.dailyJsVersion = DailyIframe.version();
    this._iframe = iframeish;
    this._callObjectMode = properties.layout === 'none' && !this._iframe;
    this._preloadCache = initializePreloadCache();
    if (this._callObjectMode) {
      window._dailyPreloadCache = this._preloadCache;
    }

    if (properties.showLocalVideo !== undefined) {
      if (this._callObjectMode) {
        console.error('showLocalVideo is not available in call object mode');
      } else {
        this._showLocalVideo = !!properties.showLocalVideo;
      }
    } else {
      this._showLocalVideo = true;
    }

    if (properties.showParticipantsBar !== undefined) {
      if (this._callObjectMode) {
        console.error(
          'showParticipantsBar is not available in call object mode'
        );
      } else {
        this._showParticipantsBar = !!properties.showParticipantsBar;
      }
    } else {
      this._showParticipantsBar = true;
    }

    if (properties.activeSpeakerMode !== undefined) {
      if (this._callObjectMode) {
        console.error('activeSpeakerMode is not available in call object mode');
      } else {
        this._activeSpeakerMode = !!properties.activeSpeakerMode;
      }
    } else {
      this._activeSpeakerMode = false;
    }

    if (properties.receiveSettings) {
      if (this._callObjectMode) {
        this._receiveSettings = properties.receiveSettings;
      } else {
        console.error('receiveSettings is only available in call object mode');
      }
    } else {
      // Here we avoid falling back to defaults, instead letting the call
      // machine decide on defaults when its loaded and telling us about them
      // via a DAILY_EVENT_RECEIVE_SETTINGS_UPDATED event. This will make it
      // easier to update defaults in the future, eliminating the worry of
      // daily-js getting out of sync with the call machine.
      this._receiveSettings = {};
    }

    this._inputSettings = {};
    if (properties.inputSettings) {
      // #Question: Do I need the call-object check here?
      this._inputSettings = properties.inputSettings;
    }

    this.validateProperties(properties);
    this.properties = { ...properties };
    this._callObjectLoader = this._callObjectMode
      ? new CallObjectLoader()
      : null;
    this._meetingState = DAILY_STATE_NEW; // only update via updateIsPreparingToJoin() or updateMeetingState()
    this._isPreparingToJoin = false; // only update via updateMeetingState()
    this._accessState = { access: DAILY_ACCESS_UNKNOWN };
    this._nativeInCallAudioMode = NATIVE_AUDIO_MODE_VIDEO_CALL;
    this._participants = {};
    this._rmpPlayerState = {};
    this._waitingParticipants = {};
    this._inputEventsOn = {}; // need to cache these until loaded
    this._network = { threshold: 'good', quality: 100 };
    this._activeSpeaker = {};
    this._callFrameId = randomStringId();
    this._messageChannel = isReactNative()
      ? new ReactNativeMessageChannel()
      : new WebMessageChannel();

    // fullscreen event listener
    if (this._iframe) {
      if (this._iframe.requestFullscreen) {
        // chrome (not safari)
        this._iframe.addEventListener('fullscreenchange', (e) => {
          if (document.fullscreenElement === this._iframe) {
            this.emit(DAILY_EVENT_FULLSCREEN, {
              action: DAILY_EVENT_FULLSCREEN,
            });
            this.sendMessageToCallMachine({ action: DAILY_EVENT_FULLSCREEN });
          } else {
            this.emit(DAILY_EVENT_EXIT_FULLSCREEN, {
              action: DAILY_EVENT_EXIT_FULLSCREEN,
            });
            this.sendMessageToCallMachine({
              action: DAILY_EVENT_EXIT_FULLSCREEN,
            });
          }
        });
      } else if (this._iframe.webkitRequestFullscreen) {
        // safari
        this._iframe.addEventListener('webkitfullscreenchange', (e) => {
          if (document.webkitFullscreenElement === this._iframe) {
            this.emit(DAILY_EVENT_FULLSCREEN, {
              action: DAILY_EVENT_FULLSCREEN,
            });
            this.sendMessageToCallMachine({ action: DAILY_EVENT_FULLSCREEN });
          } else {
            this.emit(DAILY_EVENT_EXIT_FULLSCREEN, {
              action: DAILY_EVENT_EXIT_FULLSCREEN,
            });
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

    this.resetMeetingDependentVars();
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

  accessState() {
    if (!this._callObjectMode) {
      throw new Error(
        'accessState() currently only supported in call object mode'
      );
    }

    return this._accessState;
  }

  participants() {
    return this._participants;
  }

  waitingParticipants() {
    if (!this._callObjectMode) {
      throw new Error(
        'waitingParticipants() currently only supported in call object mode'
      );
    }

    return this._waitingParticipants;
  }

  validateParticipantProperties(sessionId, properties) {
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
  }

  updateParticipant(sessionId, properties) {
    if (
      this._participants.local &&
      this._participants.local.session_id === sessionId
    ) {
      sessionId = 'local';
    }
    if (sessionId && properties && this._participants[sessionId]) {
      this.validateParticipantProperties(sessionId, properties);
      this.sendMessageToCallMachine({
        action: DAILY_METHOD_UPDATE_PARTICIPANT,
        id: sessionId,
        properties,
      });
    }
    return this;
  }

  updateParticipants(properties) {
    const localId =
      this._participants.local && this._participants.local.session_id;
    for (var sessionId in properties) {
      if (sessionId === localId) {
        sessionId = 'local';
      }
      if (
        sessionId &&
        properties[sessionId] &&
        (this._participants[sessionId] || sessionId === '*')
      ) {
        this.validateParticipantProperties(sessionId, properties[sessionId]);
      } else {
        console.warn(
          `unrecognized participant in updateParticipants: ${sessionId}`
        );
        delete properties[sessionId];
      }
    }
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_UPDATE_PARTICIPANTS,
      participants: properties,
    });
    return this;
  }

  async updateWaitingParticipant(id = '', updates = {}) {
    // Validate mode.
    if (!this._callObjectMode) {
      throw new Error(
        'updateWaitingParticipant() currently only supported in call object mode'
      );
    }

    // Validate meeting state: only allowed once you've joined.
    if (this._meetingState !== DAILY_STATE_JOINED) {
      throw new Error(
        'updateWaitingParticipant() only supported for joined meetings'
      );
    }

    // Validate argument presence.
    if (!(typeof id === 'string' && typeof updates === 'object')) {
      throw new Error(
        'updateWaitingParticipant() must take an id string and a updates object'
      );
    }

    return new Promise((resolve, reject) => {
      const k = (msg) => {
        if (msg.error) {
          reject(msg.error);
        }

        if (!msg.id) {
          reject(new Error('unknown error in updateWaitingParticipant()'));
        }

        resolve({ id: msg.id });
      };
      this.sendMessageToCallMachine(
        {
          action: DAILY_METHOD_UPDATE_WAITING_PARTICIPANT,
          id,
          updates,
        },
        k
      );
    });
  }

  async updateWaitingParticipants(updatesById = {}) {
    // Validate mode.
    if (!this._callObjectMode) {
      throw new Error(
        'updateWaitingParticipants() currently only supported in call object mode'
      );
    }

    // Validate meeting state: only allowed once you've joined.
    if (this._meetingState !== DAILY_STATE_JOINED) {
      throw new Error(
        'updateWaitingParticipants() only supported for joined meetings'
      );
    }

    // Validate argument presence.
    if (typeof updatesById !== 'object') {
      throw new Error(
        'updateWaitingParticipants() must take a mapping between ids and update objects'
      );
    }

    return new Promise((resolve, reject) => {
      const k = (msg) => {
        if (msg.error) {
          reject(msg.error);
        }

        if (!msg.ids) {
          reject(new Error('unknown error in updateWaitingParticipants()'));
        }

        resolve({ ids: msg.ids });
      };
      this.sendMessageToCallMachine(
        {
          action: DAILY_METHOD_UPDATE_WAITING_PARTICIPANTS,
          updatesById,
        },
        k
      );
    });
  }

  async requestAccess({
    access = { level: DAILY_ACCESS_LEVEL_FULL },
    name = '',
  } = {}) {
    // Validate mode.
    if (!this._callObjectMode) {
      throw new Error(
        'requestAccess() currently only supported in call object mode'
      );
    }

    // Validate meeting state: access requesting is only allowed once you've
    // joined.
    if (this._meetingState !== DAILY_STATE_JOINED) {
      throw new Error('requestAccess() only supported for joined meetings');
    }

    return new Promise((resolve, reject) => {
      const k = (msg) => {
        if (msg.error) {
          reject(msg.error);
        }

        if (!msg.access) {
          reject(new Error('unknown error in requestAccess()'));
        }

        resolve({ access: msg.access, granted: msg.granted });
      };
      this.sendMessageToCallMachine(
        {
          action: DAILY_METHOD_REQUEST_ACCESS,
          access,
          name,
        },
        k
      );
    });
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

  // NOTE: "base" receive settings will not appear until the call machine bundle
  // is initialized (e.g. after a call to join()).
  // Listen for the receive-settings-updated to be notified when those come in.
  async getReceiveSettings(id, { showInheritedValues = false } = {}) {
    // Validate mode.
    if (!this._callObjectMode) {
      throw new Error(
        'getReceiveSettings() only supported in call object mode'
      );
    }

    // This method can be called in two main ways:
    // - it can get receive settings for a specific participant (or "base")
    // - it can get *all* receive settings
    switch (typeof id) {
      // Case: getting receive settings for a single participant
      case 'string':
        // Ask call machine to get receive settings for the participant.
        // Centralizing this nontrivial fetching logic in the call machine,
        // rather than attempting to duplicate it here, avoids the problem of
        // daily-js and the call machine getting out of sync.
        return new Promise((resolve) => {
          const k = (msg) => {
            resolve(msg.receiveSettings);
          };
          this.sendMessageToCallMachine(
            {
              action: DAILY_METHOD_GET_SINGLE_PARTICIPANT_RECEIVE_SETTINGS,
              id,
              showInheritedValues,
            },
            k
          );
        });
      // Case: getting all receive settings
      case 'undefined':
        return this._receiveSettings;
      default:
        throw new Error(
          'first argument to getReceiveSettings() must be a participant id (or "base"), or there should be no arguments'
        );
    }
  }

  async updateReceiveSettings(receiveSettings) {
    // Validate mode.
    if (!this._callObjectMode) {
      throw new Error(
        'updateReceiveSettings() only supported in call object mode'
      );
    }

    // Validate receive settings.
    if (
      !validateReceiveSettings(receiveSettings, {
        allowAllParticipantsKey: true,
      })
    ) {
      throw new Error(
        receiveSettingsValidationHelpMsg({ allowAllParticipantsKey: true })
      );
    }

    // Validate that call machine is joined.
    // (We need the Redux state to be set up first; technically, we could
    // proceed if we've either join()ed *or* preAuth()ed *or* startCamera()ed
    // but since there's an easy alternative way to specify initial receive
    // settings until join(), for simplicity let's just require that we be
    // joined).
    if (this._meetingState !== DAILY_STATE_JOINED) {
      throw new Error(
        'updateReceiveSettings() is only allowed when joined. To specify receive settings earlier, use the receiveSettings config property.'
      );
    }

    // Ask call machine to update receive settings, then await callback.
    return new Promise((resolve) => {
      const k = (msg) => {
        resolve({ receiveSettings: msg.receiveSettings });
      };
      this.sendMessageToCallMachine(
        {
          action: DAILY_METHOD_UPDATE_RECEIVE_SETTINGS,
          receiveSettings,
        },
        k
      );
    });
  }

  // Input Settings Getter
  // { video: { processor } }
  // In the future:
  // { video: {...}, audio: {...}, screenVideo: {...}, screenAudio: {...} }
  getInputSettings() {
    return new Promise((resolve) => {
      resolve(this._inputSettings);
    });
  }

  async updateInputSettings(inputSettings) {
    //#Question: Do I need the call-object mode check for input-settings?
    if (!validateInputSettings(inputSettings)) {
      console.error(inputSettingsValidationHelpMsg());
      return;
    }

    // Ask call machine to update input settings, then await callback.
    return new Promise((resolve) => {
      const k = (msg) => {
        resolve({ inputSettings: msg.inputSettings });
      };
      this.sendMessageToCallMachine(
        {
          action: DAILY_METHOD_UPDATE_INPUT_SETTINGS,
          inputSettings,
        },
        k
      );
    });
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

  getDailyLang() {
    methodNotSupportedInReactNative();
    return new Promise(async (resolve) => {
      const k = (msg) => {
        delete msg.action;
        delete msg.callbackStamp;
        resolve(msg);
      };
      this.sendMessageToCallMachine({ action: DAILY_METHOD_GET_LANG }, k);
    });
  }

  setDailyLang(lang) {
    methodNotSupportedInReactNative();
    this.sendMessageToCallMachine({ action: DAILY_METHOD_SET_LANG, lang });
    return this;
  }

  async getMeetingSession() {
    // Validate meeting state: meeting session details are only available
    // once you have joined the meeting
    if (this._meetingState !== DAILY_STATE_JOINED) {
      throw new Error('getMeetingSession() is only allowed when joined');
    }
    return new Promise(async (resolve) => {
      const k = (msg) => {
        delete msg.action;
        delete msg.callbackStamp;
        delete msg.callFrameId;
        resolve(msg);
      };
      this.sendMessageToCallMachine(
        { action: DAILY_METHOD_GET_MEETING_SESSION },
        k
      );
    });
  }

  setUserName(name, options) {
    this.properties.userName = name;
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
          thisMeetingOnly:
            isReactNative() || (options ? !!options.thisMeetingOnly : false),
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
          preloadCache: makeSafeForPostMessage(this._preloadCache),
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

    // if we're in callObject mode and not loaded yet, don't do anything
    if (this._callObjectMode && this.needsLoad()) {
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

        if (msg.returnPreloadCache) {
          resolve({
            camera: { deviceId: this._preloadCache.videoDeviceId },
            mic: { deviceId: this._preloadCache.audioDeviceId },
            speaker: { deviceId: this._preloadCache.outputDeviceId },
          });
          return;
        }

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

    // if we're in callObject mode and neither joined nor pre-authed yet, don't do anything
    if (
      this._callObjectMode &&
      !(this._meetingState === DAILY_STATE_JOINED || this._didPreAuth)
    ) {
      console.warn(
        'setOutputDevice() not supported before preAuth() or join()'
      );
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
    if (this._callObjectMode && this.needsLoad()) {
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

        if (msg.returnPreloadCache) {
          resolve({
            camera: { deviceId: this._preloadCache.videoDeviceId },
            mic: { deviceId: this._preloadCache.audioDeviceId },
            speaker: { deviceId: this._preloadCache.outputDeviceId },
          });
          return;
        }

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
      this.isMeetingPendingOrOngoing(
        this._meetingState,
        this._isPreparingToJoin
      )
    ) {
      this.nativeUtils().setAudioMode(this._nativeInCallAudioMode);
    }

    return this;
  }

  async preAuth(properties = {}) {
    // Validate mode.
    if (!this._callObjectMode) {
      throw new Error('preAuth() currently only supported in call object mode');
    }

    // Validate meeting state: pre-auth is only allowed if you haven't already
    // joined (or aren't in the process of joining).
    if (
      [DAILY_STATE_JOINING, DAILY_STATE_JOINED].includes(this._meetingState)
    ) {
      throw new Error('preAuth() not supported after joining a meeting');
    }

    // Load call machine bundle, if needed.
    if (this.needsLoad()) {
      await this.load(properties);
    }

    // Assign properties, ensuring that at a minimum url is set.
    // Disallow changing to a url with a different bundle url than the one used
    // for load().
    if (!properties.url) {
      throw new Error('preAuth() requires at least a url to be provided');
    }
    const newBundleUrl = callObjectBundleUrl(properties.url);
    const loadedBundleUrl = callObjectBundleUrl(
      this.properties.url || this.properties.baseUrl
    );
    if (newBundleUrl !== loadedBundleUrl) {
      throw new Error(
        `url in preAuth() has a different bundle url than the one loaded (${loadedBundleUrl} -> ${newBundleUrl})`
      );
    }
    this.validateProperties(properties);
    this.properties = { ...this.properties, ...properties };

    // Pre-auth with the server.
    return new Promise((resolve, reject) => {
      const k = (msg) => {
        if (msg.error) {
          return reject(msg.error);
        }

        if (!msg.access) {
          return reject(new Error('unknown error in preAuth()'));
        }

        // Set a flag indicating that we've pre-authed.
        // This flag has the effect of "locking in" url and token, so that they
        // can't be changed subsequently on join(), which would invalidate this
        // pre-auth.
        this._didPreAuth = true;

        resolve({ access: msg.access });
      };
      this.sendMessageToCallMachine(
        {
          action: DAILY_METHOD_PREAUTH,
          properties: makeSafeForPostMessage(this.properties),
        },
        k
      );
    });
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
      console.log("could not emit 'loading'", e);
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
              this.resetMeetingDependentVars();
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

      // Validate that any provided url or token doesn't conflict with url or
      // token already used to preAuth()
      if (this._didPreAuth) {
        if (properties.url && properties.url !== this.properties.url) {
          console.error(
            `url in join() is different than the one used in preAuth()`
          );
          this.updateIsPreparingToJoin(false);
          return Promise.reject();
        }
        if (properties.token && properties.token !== this.properties.token) {
          console.error(
            `token in join() is different than the one used in preAuth()`
          );
          this.updateIsPreparingToJoin(false);
          return Promise.reject();
        }
      }

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
              `url in join() has a different bundle url than the one loaded (${loadedBundleUrl} -> ${newBundleUrl})`
            );
            this.updateIsPreparingToJoin(false);
            return Promise.reject();
          }
          this.properties.url = properties.url;
        } else {
          // iframe mode
          if (properties.url && properties.url !== this.properties.url) {
            console.error(
              `url in join() is different than the one used in load() (${this.properties.url} -> ${properties.url})`
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
      console.log("could not emit 'joining-meeting'", e);
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
            if (this._callObjectMode) {
              Participant.addTracks(participants[id]);
              Participant.addCustomTracks(participants[id]);
              Participant.addLegacyTracks(
                participants[id],
                this._participants[id]
              );
            }
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
      if (this._callObjectLoader && !this._callObjectLoader.loaded) {
        // If call object bundle never successfully loaded, cancel load if
        // needed and clean up state immediately (without waiting for call
        // machine to clean up its state).
        this._callObjectLoader.cancel();
        this.updateMeetingState(DAILY_STATE_LEFT);
        this.resetMeetingDependentVars();
        try {
          this.emit(DAILY_STATE_LEFT, { action: DAILY_STATE_LEFT });
        } catch (e) {
          console.log("could not emit 'left-meeting'", e);
        }
        resolve();
      } else if (
        this._meetingState === DAILY_STATE_LEFT ||
        this._meetingState === DAILY_STATE_ERROR
      ) {
        // nothing to do, here, just resolve
        resolve();
      } else {
        // TODO: the possibility that the iframe call machine is not yet loaded
        // is never handled here...
        this.sendMessageToCallMachine({ action: DAILY_METHOD_LEAVE }, () => {
          resolve();
        });
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

  startRecording(args = {}) {
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_START_RECORDING,
      ...args,
    });
  }

  updateRecording({ layout = { preset: 'default' } }) {
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_UPDATE_RECORDING,
      layout,
    });
  }

  stopRecording() {
    this.sendMessageToCallMachine({ action: DAILY_METHOD_STOP_RECORDING });
  }

  startLiveStreaming(args = {}) {
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_START_LIVE_STREAMING,
      ...args,
    });
  }

  updateLiveStreaming({ layout = { preset: 'default' } }) {
    this.sendMessageToCallMachine({
      action: DAILY_METHOD_UPDATE_LIVE_STREAMING,
      layout,
    });
  }

  stopLiveStreaming() {
    this.sendMessageToCallMachine({ action: DAILY_METHOD_STOP_LIVE_STREAMING });
  }

  async startRemoteMediaPlayer({
    url,
    settings = {
      state: DAILY_JS_REMOTE_MEDIA_PLAYER_SETTING.PLAY,
    },
  }) {
    try {
      validateRemotePlayerUrl(url);
      validateRemotePlayerStateSettings(settings);
      validateRemotePlayerEncodingSettings(settings);
    } catch (e) {
      console.error(`invalid argument Error: ${e}`);
      console.error(remoteMediaPlayerStartValidationHelpMsg());
      throw e;
    }

    return new Promise(async (resolve, reject) => {
      let k = (msg) => {
        if (msg.error) {
          reject({ error: msg.error, errorMsg: msg.errorMsg });
        } else {
          resolve({
            session_id: msg.session_id,
            remoteMediaPlayerState: {
              state: msg.state,
              settings: msg.settings,
            },
          });
        }
      };
      this.sendMessageToCallMachine(
        {
          action: DAILY_METHOD_START_REMOTE_MEDIA_PLAYER,
          url: url,
          settings: settings,
        },
        k
      );
    });
  }

  async stopRemoteMediaPlayer(session_id) {
    if (typeof session_id !== 'string')
      throw new Error(' remotePlayerID must be of type string');

    return new Promise(async (resolve, reject) => {
      let k = (msg) => {
        if (msg.error) {
          reject({ error: msg.error, errorMsg: msg.errorMsg });
        } else {
          resolve();
        }
      };
      this.sendMessageToCallMachine(
        { action: DAILY_METHOD_STOP_REMOTE_MEDIA_PLAYER, session_id },
        k
      );
    });
  }

  async updateRemoteMediaPlayer({ session_id, settings }) {
    // TODO: Add check of the current_state === desired state
    // And resolve() from here itself.
    try {
      validateRemotePlayerStateSettings(settings);
    } catch (e) {
      console.error(`invalid argument Error: ${e}`);
      console.error(remoteMediaPlayerUpdateValidationHelpMsg());
      throw e;
    }

    return new Promise(async (resolve, reject) => {
      let k = (msg) => {
        if (msg.error) {
          reject({ error: msg.error, errorMsg: msg.errorMsg });
        } else {
          resolve({
            session_id: msg.session_id,
            remoteMediaPlayerState: {
              state: msg.state,
              settings: msg.settings,
            },
          });
        }
      };
      this.sendMessageToCallMachine(
        {
          action: DAILY_METHOD_UPDATE_REMOTE_MEDIA_PLAYER,
          session_id: session_id,
          settings: settings,
        },
        k
      );
    });
  }

  startTranscription() {
    this.sendMessageToCallMachine({ action: DAILY_METHOD_START_TRANSCRIPTION });
  }

  stopTranscription() {
    this.sendMessageToCallMachine({ action: DAILY_METHOD_STOP_TRANSCRIPTION });
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
        'setSubscribeToTracksAutomatically() is only allowed when joined'
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

  theme() {
    if (this._callObjectMode) {
      console.error('theme is not available in callObject mode');
      return this;
    }
    return this.properties.theme;
  }

  setTheme(theme) {
    return new Promise((resolve, reject) => {
      if (this._callObjectMode) {
        reject('setTheme is not available in callObject mode');
        return;
      }
      try {
        this.validateProperties({
          theme,
        });
        this.properties.theme = {
          ...theme,
        };
        // Send message to Prebuilt UI Iframe driver
        this.sendMessageToCallMachine({
          action: DAILY_METHOD_SET_THEME,
          theme: this.properties.theme,
        });
        /**
         * For simplicity, emitting theme-updated here rather than
         * listening for it from Prebuilt & re-emitting it, since:
         * - we've fully validated the theme, so there's no risk of it not being applied
         * - we set `this.properties.theme` first, so in a customer's `theme-updated`
         *   handler, a call to `theme()` will return the latest value
         * - this method is the only way `theme-updated` can change
         */
        try {
          this.emit(DAILY_EVENT_THEME_UPDATED, {
            action: DAILY_EVENT_THEME_UPDATED,
            theme: this.properties.theme,
          });
        } catch (e) {
          console.log("could not emit 'theme-updated'", e);
        }
        resolve(this.properties.theme);
      } catch (e) {
        reject(e);
      }
    });
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
    if (
      !this._iframe ||
      document.fullscreenElement ||
      !isFullscreenSupported()
    ) {
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

  async room({ includeRoomConfigDefaults = true } = {}) {
    if (this._meetingState === DAILY_STATE_JOINED || this._didPreAuth) {
      // We've succesfully join()ed or preAuth()ed, so we should have room info.
      return new Promise((resolve, _) => {
        let k = (msg) => {
          delete msg.action;
          delete msg.callbackStamp;
          resolve(msg);
        };
        this.sendMessageToCallMachine(
          { action: DAILY_METHOD_ROOM, includeRoomConfigDefaults },
          k
        );
      });
    } else {
      // Return the URL of the room we'll be in if/when we successfully join(),
      // since we have no other room info to show yet.
      if (this.properties.url) {
        // NOTE: technically this should be called "roomUrlPendingJoinOrPreauth"
        // to indicate that *either* a join() or a preAuth() will allow you to
        // access room info, but preAuth() was added later and this name was
        // preserved to maintain backward compatibility: if a consumer hasn't
        // updated their app to use preAuth(), they'll be none the wiser.
        return { roomUrlPendingJoin: this.properties.url };
      }
      return null;
    }
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

  async getNetworkTopology() {
    return new Promise(async (resolve, reject) => {
      let k = (msg) => {
        if (msg.error) {
          reject({ error: msg.error });
        } else {
          resolve({ topology: msg.topology });
        }
      };
      this.sendMessageToCallMachine(
        { action: DAILY_METHOD_GET_NETWORK_TOPOLOGY },
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

  ///
  /// The below *packagedMessage* methods facilitate wiring up a DailyIframe
  /// instance as a remote driver of another DailyIframe instance, like in the
  /// new prebuilt UI case, where an "outer" callFrame controls an "inner"
  /// callObject through an intermediate iframed app.
  ///

  forwardPackagedMessageToCallMachine(msg) {
    this._messageChannel.forwardPackagedMessageToCallMachine(
      msg,
      this._iframe,
      this._callFrameId
    );
  }

  addListenerForPackagedMessagesFromCallMachine(listener) {
    return this._messageChannel.addListenerForPackagedMessagesFromCallMachine(
      listener,
      this._callFrameId
    );
  }

  removeListenerForPackagedMessagesFromCallMachine(listenerId) {
    this._messageChannel.removeListenerForPackagedMessagesFromCallMachine(
      listenerId
    );
  }

  handleMessageFromCallMachine(msg) {
    switch (msg.action) {
      case DAILY_EVENT_IFRAME_READY_FOR_LAUNCH_CONFIG:
        this.sendMessageToCallMachine({
          action: DAILY_EVENT_IFRAME_LAUNCH_CONFIG,
          ...this.properties,
        });
        break;
      case DAILY_EVENT_LOADED:
        if (this._loadedCallback) {
          this._loadedCallback();
          this._loadedCallback = null;
        }
        try {
          this.emit(msg.action, msg);
        } catch (e) {
          console.log('could not emit', msg, e);
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
          console.log('could not emit', msg, e);
        }
        break;
      case DAILY_EVENT_PARTICIPANT_JOINED:
      case DAILY_EVENT_PARTICIPANT_UPDATED:
        if (this._meetingState === DAILY_STATE_LEFT) {
          return;
        }
        if (msg.participant && msg.participant.session_id) {
          let id = msg.participant.local ? 'local' : msg.participant.session_id;
          if (this._callObjectMode) {
            Participant.addTracks(msg.participant);
            Participant.addCustomTracks(msg.participant);
            Participant.addLegacyTracks(
              msg.participant,
              this._participants[id]
            );
          }

          try {
            // track events
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
            // custom tracks (presumably we'll do all tracks consistently in the
            // future, refactoring the above maybeEventTrack* events)
            this.maybeEventTrackStoppedForCustomTracks(
              this._participants[id],
              msg.participant
            );
            this.maybeEventTrackStartedForCustomTracks(
              this._participants[id],
              msg.participant
            );

            // recording events
            this.maybeEventRecordingStopped(
              this._participants[id],
              msg.participant
            );
            this.maybeEventRecordingStarted(
              this._participants[id],
              msg.participant
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
              console.log('could not emit', msg, e);
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
            this.maybeEventTrackStoppedForCustomTracks(prevP, null);
          }
          // delete from local cach
          delete this._participants[msg.participant.session_id];
          try {
            this.emit(msg.action, msg);
          } catch (e) {
            console.log('could not emit', msg, e);
          }
        }
        break;
      case DAILY_EVENT_ACCESS_STATE_UPDATED:
        let newAccessState = {
          access: msg.access,
        };
        if (msg.awaitingAccess) {
          newAccessState.awaitingAccess = msg.awaitingAccess;
        }
        if (!deepEqual(this._accessState, newAccessState)) {
          this._accessState = newAccessState;
          try {
            this.emit(msg.action, msg);
          } catch (e) {
            console.log('could not emit', msg, e);
          }
        }
        break;
      case DAILY_EVENT_MEETING_SESSION_UPDATED:
        if (msg.meetingSession) {
          try {
            delete msg.callFrameId;
            this.emit(msg.action, msg);
          } catch (e) {
            console.log('could not emit', msg, e);
          }
        }
        break;
      case DAILY_EVENT_ERROR:
        if (this._iframe && !msg.preserveIframe) {
          this._iframe.src = '';
        }
        this.updateMeetingState(DAILY_STATE_ERROR);
        this.resetMeetingDependentVars();
        if (this._loadedCallback) {
          this._loadedCallback(msg.errorMsg);
          this._loadedCallback = null;
        }
        if (this._joinedCallback) {
          this._joinedCallback(null, msg.errorMsg);
          this._joinedCallback = null;
        }
        try {
          let { preserveIframe, ...event } = msg;
          this.emit(msg.action, event);
        } catch (e) {
          console.log('could not emit', msg, e);
        }
        break;
      case DAILY_EVENT_LEFT_MEETING:
        if (this._meetingState !== DAILY_STATE_ERROR) {
          this.updateMeetingState(DAILY_STATE_LEFT);
        }
        this.resetMeetingDependentVars();
        try {
          this.emit(msg.action, msg);
        } catch (e) {
          console.log('could not emit', msg, e);
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
          console.log('could not emit', msg, e);
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
            console.log('could not emit', msg, e);
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
            console.log('could not emit', msg, e);
          }
        }
        break;
      case DAILY_EVENT_SHOW_LOCAL_VIDEO_CHANGED:
        if (this._callObjectMode) return;
        const { show } = msg;
        this._showLocalVideo = show;
        try {
          this.emit(msg.action, {
            action: msg.action,
            show,
          });
        } catch (e) {
          console.log('could not emit', msg, e);
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
            console.log('could not emit', msg, e);
          }
        }
        break;
      case DAILY_EVENT_WAITING_PARTICIPANT_ADDED:
      case DAILY_EVENT_WAITING_PARTICIPANT_UPDATED:
      case DAILY_EVENT_WAITING_PARTICIPANT_REMOVED:
        this._waitingParticipants = msg.allWaitingParticipants;
        try {
          this.emit(msg.action, {
            action: msg.action,
            participant: msg.participant,
          });
        } catch (e) {
          console.log('could not emit', msg, e);
        }
        break;
      case DAILY_EVENT_RECEIVE_SETTINGS_UPDATED:
        // NOTE: doing equality check here rather than before sending message in
        // the first place from call machine, to simplify handling initial
        // receive settings
        if (!deepEqual(this._receiveSettings, msg.receiveSettings)) {
          this._receiveSettings = msg.receiveSettings;
          try {
            this.emit(msg.action, {
              action: msg.action,
              receiveSettings: msg.receiveSettings,
            });
          } catch (e) {
            console.log('could not emit', msg, e);
          }
        }
        break;
      case DAILY_EVENT_INPUT_SETTINGS_UPDATED:
        // NOTE: doing equality check here rather than before sending message in
        // the first place from call machine, to simplify handling initial
        // input settings
        if (!deepEqual(this._inputSettings, msg.inputSettings)) {
          this._inputSettings = msg.inputSettings;
          try {
            this.emit(msg.action, {
              action: msg.action,
              inputSettings: msg.inputSettings,
            });
          } catch (e) {
            console.log('could not emit', msg, e);
          }
        }
        break;
      case DAILY_EVENT_REMOTE_MEDIA_PLAYER_STARTED:
        {
          let participantId = msg.session_id;
          this._rmpPlayerState[participantId] = msg.playerState;
          this.emitDailyJSEvent(msg);
        }
        break;

      case DAILY_EVENT_REMOTE_MEDIA_PLAYER_STOPPED:
        delete this._rmpPlayerState[msg.session_id];
        this.emitDailyJSEvent(msg);
        break;

      case DAILY_EVENT_REMOTE_MEDIA_PLAYER_UPDATED:
        {
          let participantId = msg.session_id;
          let rmpPlayerState = this._rmpPlayerState[participantId];
          if (
            !rmpPlayerState ||
            !this.compareEqualForRMPUpdateEvent(
              rmpPlayerState,
              msg.remoteMediaPlayerState
            )
          ) {
            this._rmpPlayerState[participantId] = msg.remoteMediaPlayerState;
            this.emitDailyJSEvent(msg);
          }
        }
        break;

      case DAILY_EVENT_RECORDING_STARTED:
      case DAILY_EVENT_RECORDING_STOPPED:
      case DAILY_EVENT_RECORDING_STATS:
      case DAILY_EVENT_RECORDING_ERROR:
      case DAILY_EVENT_RECORDING_UPLOAD_COMPLETED:
      case DAILY_EVENT_TRANSCRIPTION_STARTED:
      case DAILY_EVENT_TRANSCRIPTION_STOPPED:
      case DAILY_EVENT_TRANSCRIPTION_ERROR:
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
      case DAILY_EVENT_NONFATAL_ERROR:
      case DAILY_EVENT_LANG_UPDATED:
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

  maybeEventRecordingStopped(prevP, thisP) {
    const key = 'record';
    if (!prevP) {
      return;
    }
    if (!thisP.local && thisP[key] === false && prevP[key] !== thisP[key]) {
      try {
        this.emit(DAILY_EVENT_RECORDING_STOPPED, {
          action: DAILY_EVENT_RECORDING_STOPPED,
        });
      } catch (e) {
        console.log('could not emit', e);
      }
    }
  }

  maybeEventRecordingStarted(prevP, thisP) {
    const key = 'record';
    if (!prevP) {
      return;
    }
    if (!thisP.local && thisP[key] === true && prevP[key] !== thisP[key]) {
      try {
        this.emit(DAILY_EVENT_RECORDING_STARTED, {
          action: DAILY_EVENT_RECORDING_STARTED,
        });
      } catch (e) {
        console.log('could not emit', e);
      }
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

  maybeEventCustomTrackStopped(prevTrack, thisTrack, prevP, thisP) {
    if (!prevTrack) {
      return;
    }
    // TODO: This check will return even when the rmp track was stopped due to a network interrupt.
    //We should revisit this to take care of this scenario and trigger a `track-stopped` event.
    if (
      thisP &&
      thisP.remoteMediaPlayerState &&
      (thisP.remoteMediaPlayerState.state ==
        DAILY_JS_REMOTE_MEDIA_PLAYER_STATE.PLAYING ||
        thisP.remoteMediaPlayerState.state ==
          DAILY_JS_REMOTE_MEDIA_PLAYER_STATE.PAUSED)
    ) {
      return;
    }
    if (
      (prevTrack && prevTrack.readyState === 'ended') ||
      (prevTrack && !thisTrack) ||
      (prevTrack && prevTrack.id !== thisTrack.id)
    ) {
      try {
        this.emit(DAILY_EVENT_TRACK_STOPPED, {
          action: DAILY_EVENT_TRACK_STOPPED,
          track: prevTrack,
          participant: prevP,
        });
      } catch (e) {
        console.log('maybeEventCustomTrackStopped: could not emit', e);
      }
    }
  }

  maybeEventCustomTrackStarted(prevTrack, thisTrack, thisP) {
    if (
      (thisTrack && !prevTrack) ||
      (thisTrack && prevTrack.readyState === 'ended') ||
      (thisTrack && thisTrack.id !== prevTrack.id)
    ) {
      try {
        this.emit(DAILY_EVENT_TRACK_STARTED, {
          action: DAILY_EVENT_TRACK_STARTED,
          track: thisTrack,
          participant: thisP,
        });
      } catch (e) {
        console.log('maybeEventCustomTrackStarted: could not emit', e);
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

  maybeEventTrackStoppedForCustomTracks(prevP, thisP) {
    if (!prevP) {
      return;
    }
    for (const trackKey in prevP.tracks) {
      // we might be able to use this logic for all tracks, not just additional,
      // non-standard tracks. but for now, we'll only handle the non-standard
      // tracks
      if (Participant.isPredefinedTrack(trackKey)) {
        continue;
      }
      this.maybeEventCustomTrackStopped(
        prevP.tracks[trackKey].track,
        thisP ? thisP.tracks[trackKey].track : null,
        prevP,
        thisP
      );
    }
  }

  maybeEventTrackStartedForCustomTracks(prevP, thisP) {
    if (!thisP) {
      return;
    }
    for (const trackKey in thisP.tracks) {
      // we might be able to use this logic for all tracks, not just additional,
      // non-standard tracks. but for now, we'll only handle the non-standard
      // tracks
      if (Participant.isPredefinedTrack(trackKey)) {
        continue;
      }
      this.maybeEventCustomTrackStarted(
        prevP ? prevP.tracks[trackKey].track : null,
        thisP.tracks[trackKey].track,
        thisP
      );
    }
  }

  compareEqualForRMPUpdateEvent(a, b) {
    if (a.state === b.state) {
      return true;
    }
    return false;
  }

  emitDailyJSEvent(msg) {
    {
      try {
        this.emit(msg.action, msg);
      } catch (e) {
        console.log('could not emit', msg, e);
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

  // To be invoked this when leaving or erroring out of a meeting.
  // NOTE (Paul, 2021-01-07): this could probably be expanded to reset *all*
  // meeting-dependent vars, but starting with this targeted small set which
  // were being reset properly on leave() but not when leaving via prebuilt ui.
  resetMeetingDependentVars() {
    this._participants = {};
    this._waitingParticipants = {};
    this._activeSpeaker = {};
    this._activeSpeakerMode = false;
    this._didPreAuth = false;
    this._accessState = { access: DAILY_ACCESS_UNKNOWN };
    this._receiveSettings = {};
    this._inputSettings = {};
    resetPreloadCache(this._preloadCache);
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
    const audioMode = useInCallAudioMode
      ? this._nativeInCallAudioMode
      : NATIVE_AUDIO_MODE_IDLE;
    this.nativeUtils().setAudioMode(audioMode);
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

function validateReceiveSettings(
  receiveSettingsParam,
  { allowAllParticipantsKey }
) {
  const isParticipantIdValid = (participantId) => {
    const disallowedKeys = ['local'];
    if (!allowAllParticipantsKey) disallowedKeys.push('*');
    return participantId && !disallowedKeys.includes(participantId);
  };
  const areVideoReceiveSettingsValid = (videoReceiveSettings) => {
    if (videoReceiveSettings.layer !== undefined) {
      if (
        !(
          (Number.isInteger(videoReceiveSettings.layer) &&
            videoReceiveSettings.layer >= 0) ||
          videoReceiveSettings.layer === 'inherit'
        )
      ) {
        return false;
      }
    }
    return true;
  };
  // NOTE: partial receive settings *are* allowed, in both senses:
  // - only a subset of media types (e.g. only "video")
  // - only a subset of settings per media type (e.g. only "layer")
  const areParticipantReceiveSettingsValid = (receiveSettings) => {
    if (!receiveSettings) return false;
    if (receiveSettings.video) {
      if (!areVideoReceiveSettingsValid(receiveSettings.video)) {
        return false;
      }
    }
    if (receiveSettings.screenVideo) {
      if (!areVideoReceiveSettingsValid(receiveSettings.screenVideo)) {
        return false;
      }
    }
    return true;
  };
  for (const [participantId, receiveSettings] of Object.entries(
    receiveSettingsParam
  )) {
    if (
      !(
        isParticipantIdValid(participantId) &&
        areParticipantReceiveSettingsValid(receiveSettings)
      )
    ) {
      return false;
    }
  }
  return true;
}

// Since currently videoProcessor is the only inputSetting. I wrote this code to reject
// everything else. I feel it is the safe approach. This will need changes as more
// functionality is added to inputSettings in the future.
function validateInputSettings(settings) {
  if (typeof settings !== 'object') return false;
  if (!(settings.video && typeof settings.video === 'object')) return false;
  if (!validateVideoProcessor(settings.video.processor)) return false;
  return true;
}

function validateVideoProcessor(p) {
  if (!p) return false;
  if (typeof p !== 'object') return false;
  if (Object.keys(p).length === 0) return false; // lodash isEmpty did not work well with github workflow for some reason
  if (p.type && !validateVideoProcessorType(p.type)) return false;
  if (p.publish !== undefined && typeof p.publish !== 'boolean') return false;
  if (p.config) {
    if (typeof p.config !== 'object') return false;
    if (!validateVideoProcessorConfig(p.type, p.config)) return false;
  }
  return true;
}

function validateVideoProcessorConfig(type, config) {
  let keys = Object.keys(config);
  if (keys.length === 0) return true;
  const configErrMsg =
    'invalid object in inputSettings -> video -> processor -> config';
  switch (type) {
    case VIDEO_PROCESSOR_TYPES.BGBLUR:
      if (keys.length > 1 || keys[0] !== 'strength') {
        console.error(configErrMsg);
        return false;
      }
      if (
        typeof config.strength !== 'number' ||
        config.strength <= 0 ||
        config.strength > 1 ||
        isNaN(config.strength)
      ) {
        console.error(
          `${configErrMsg}; expected: {0 < strength <= 1}, got: ${config.strength}`
        );
        return false;
      }
      return true;
    case VIDEO_PROCESSOR_TYPES.BGIMAGE:
      if (config.source !== undefined) {
        if (!validateAndTagBgImageSource(config)) return false;
      }
      return true;
    default:
      return true;
  }
}

function validateAndTagBgImageSource(config) {
  if (config.source === 'default') {
    config.type = 'default';
    return true;
  }
  if (validateHttpUrl(config.source)) {
    config.type = 'url';
    if (!validateBgImageFileType(config.source)) {
      console.error(
        `invalid image type; supported types: [${DAILY_SUPPORTED_BG_IMG_TYPES.join(
          ', '
        )}]`
      );
      return false;
    }
    return true;
  }
  if (validateImageSelection(config.source)) {
    config.type = 'daily-preselect';
    return true;
  } else {
    console.error(
      `invalid image selection; must be an int, > 0, <= ${DAILY_PRESELECTED_BG_IMAGE_URLS_LENGTH}`
    );
    return false;
  }
}

function validateBgImageFileType(url) {
  // ignore query params
  const parsedUrl = new URL(url);
  const fileType = parsedUrl.pathname.split('.').at(-1).toLowerCase().trim();
  return DAILY_SUPPORTED_BG_IMG_TYPES.includes(fileType);
}

function validateImageSelection(selectImg) {
  let imgNum = Number(selectImg);
  if (isNaN(imgNum)) return false;
  if (!Number.isInteger(imgNum)) return false;
  if (imgNum <= 0) return false;
  if (imgNum > DAILY_PRESELECTED_BG_IMAGE_URLS_LENGTH) return false;
  return true;
}

function validateVideoProcessorType(type) {
  if (typeof type !== 'string') return false;
  if (!Object.values(VIDEO_PROCESSOR_TYPES).includes(type)) {
    console.error('inputSettings video processor type invalid');
    return false;
  }
  return true;
}

function inputSettingsValidationHelpMsg() {
  let processorOpts = Object.values(VIDEO_PROCESSOR_TYPES).join(' | ');
  return `inputSettings must be of the form: { video: { processor: [ ${processorOpts} ] }, publish?: boolean, config?: {} }`;
}

function receiveSettingsValidationHelpMsg({ allowAllParticipantsKey }) {
  return (
    `receiveSettings must be of the form { [<remote participant id> | ${DAILY_RECEIVE_SETTINGS_BASE_KEY}${
      allowAllParticipantsKey
        ? ` | "${DAILY_RECEIVE_SETTINGS_ALL_PARTICIPANTS_KEY}"`
        : ''
    }]: ` +
    '{ ' +
    '[video: [{ layer: [<non-negative integer> | "inherit"] } | "inherit"]], ' +
    '[screenVideo: [{ layer: [<non-negative integer> | "inherit"] } | "inherit"]] ' +
    '}}}'
  );
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

function remoteMediaPlayerStartValidationHelpMsg() {
  return `startRemoteMediaPlayer arguments must be of the form: 
  { url: "playback url", 
  settings?: 
  {state: "play"|"pause", simulcastEncodings?: [{}] } }`;
}

function remoteMediaPlayerUpdateValidationHelpMsg() {
  return `updateRemoteMediaPlayer arguments must be of the form: 
  session_id: "participant session", 
  { settings?: {state: "play"|"pause"} }`;
}

function validateRemotePlayerUrl(url) {
  // TODO: add protocol check as well http://, https://. file://..
  if (typeof url !== 'string') {
    throw new Error(`url parameter must be "string" type`);
  }
}

function validateRemotePlayerStateSettings(playerSettings) {
  if (typeof playerSettings !== 'object') {
    throw new Error(`RemoteMediaPlayerSettings: must be "object" type`);
  }

  if (
    !playerSettings.state ||
    !Object.values(DAILY_JS_REMOTE_MEDIA_PLAYER_SETTING).includes(
      playerSettings.state
    )
  ) {
    throw new Error(
      `Invalid value for RemoteMediaPlayerSettings.state, valid values are: ` +
        JSON.stringify(DAILY_JS_REMOTE_MEDIA_PLAYER_SETTING)
    );
  }
}

function isValueInRange(val, min, max) {
  if (typeof val !== 'number' || val < min || val > max) {
    return false;
  }
  return true;
}

function validateRemotePlayerEncodingSettings(playerSettings) {
  for (let prop in playerSettings) {
    if (!startRmpSettingsValidKeys.includes(prop)) {
      throw new Error(
        `Invalid key ${prop}, valid keys are: ${startRmpSettingsValidKeys}`
      );
    }
  }
  // validate simulcastEncodings
  if (playerSettings.simulcastEncodings) {
    if (!(playerSettings.simulcastEncodings instanceof Array)) {
      throw new Error(`simulcastEncodings must be "Array"`);
    }
    // max 3 layers
    if (
      !isValueInRange(
        playerSettings.simulcastEncodings.length,
        0,
        MAX_SIMULCAST_LAYERS
      )
    ) {
      throw new Error(
        `"simulcastEncodings" not in range. valid range 1 to 3 layers`
      );
    }
    // check value within each simulcast layer
    playerSettings.simulcastEncodings.every((layer) => {
      for (let prop in layer) {
        // check property is valid
        if (!simulcastEncodingsValidRanges.hasOwnProperty(prop)) {
          throw new Error(
            `Invalid key ${prop}, valid keys are:` +
              Object.keys(simulcastEncodingsValidRanges)
          );
        }
        // property must be number
        if (typeof layer[prop] !== 'number') {
          throw new Error(`simulcastEncodings[].${prop} must be "number"`);
        }
        // property must be within range
        let { min, max } = simulcastEncodingsValidRanges[prop];
        if (!isValueInRange(layer[prop], min, max)) {
          throw new Error(`simulcastEncodings[].${prop} value not in range. valid range:\
        ${min} to ${max}`);
        }
      }
      // maxBitrate is mandatory
      if (!layer.hasOwnProperty('maxBitrate')) {
        throw new Error(`simulcastEncodings[].maxBitrate is not specified`);
      }
    });
  }
}
