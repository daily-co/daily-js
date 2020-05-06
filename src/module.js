import EventEmitter from 'events';
import Bowser from 'bowser';
import { deepEqual } from 'fast-equals';
import {
  filter,
  orderBy,
} from 'lodash';

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
  DAILY_METHOD_SET_ACTIVE_SPEAKER_MODE,
  DAILY_METHOD_SET_LANG,
  MAX_APP_MSG_SIZE,
  DAILY_METHOD_REGISTER_INPUT_HANDLER,
  DAILY_METHOD_DETECT_ALL_FACES,
  DAILY_METHOD_ROOM,
  DAILY_METHOD_SET_NETWORK_TOPOLOGY,
  DAILY_METHOD_SET_PLAY_DING,
  DAILY_CUSTOM_TRACK,
  DAILY_UI_REQUEST_FULLSCREEN,
  DAILY_UI_EXIT_FULLSCREEN,
} from './CommonIncludes.js';


export { DAILY_STATE_NEW, DAILY_STATE_JOINING, DAILY_STATE_JOINED,
         DAILY_STATE_LEFT, DAILY_STATE_ERROR,
         DAILY_EVENT_JOINING_MEETING, DAILY_EVENT_JOINED_MEETING,
         DAILY_EVENT_LEFT_MEETING };

//
//
//

const FRAME_PROPS = {
  url: {
    validate: (url) => typeof url === 'string',
    help: 'url should be a string'
  },
  token: {
    validate: (token) => typeof token === 'string',
    help: 'token should be a string',
    queryString: 't'
  },
  dailyConfig: {
    // only for call object mode, for now
    validate: (config) => {
      if (!window._dailyConfig) {
        window._dailyConfig = {};
      }
      window._dailyConfig.experimentalGetUserMediaConstraintsModify =
              config.experimentalGetUserMediaConstraintsModify;
      delete config.experimentalGetUserMediaConstraintsModify
      return true;
    }
  },
  lang: { 
    validate: (lang) => {
      return ['de', 'en-us', 'en', 'fi', 'fr', 'nl', 'pt'].includes(lang);
    },
    help: 'language not supported. Options are: de, en-us, en, fi, fr, nl, pt'
  },
  userName: true, // ignored if there's a token
  showLeaveButton: true,
  showFullscreenButton: true,
  // style to apply to iframe in createFrame factory method
  iframeStyle: true,
  // styles passed through to video calls inside the iframe
  customLayout: true,
  cssFile: true, cssText: true, bodyClass: true,
  videoSource: {
    validate: (s, callObject) => {
      callObject._preloadCache.videoDeviceId = s;
      return true;
    }
  },
  audioSource: {
    validate: (s, callObject) => {
      callObject._preloadCache.audioDeviceId = s;
      return true;
    }
  },
  // used internally
  layout: {
    validate: (layout) => layout === 'custom-v1' || layout === 'browser' ||
                          layout === 'none',
    help: 'layout may only be set to "custom-v1"',
    queryString: 'layout'
  },
  emb: {
    queryString: 'emb'
  },
  embHref: {
    queryString: 'embHref'
  }
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
    help: 'styles format should be a subset of: ' +
          '{ cam: {div: {}, video: {}}, screen: {div: {}, video: {}} }'
  },
  setAudio: true, setVideo: true, eject: true
};

//
//
//

export default class DailyIframe extends EventEmitter {

  //
  // browser support check
  //

  static supportedBrowser() {
    function supportsUnifiedPlanSDP(browser) {
      return browser.satisfies({
        electron: ">=6",
        chromium: ">=75",
        chrome: ">=75",
        firefox: ">=67",
        opera: ">=61",  // Corresponds to Chrome 75
        // Technically Safari 12.1 supports Unified Plan SDP, but for simplicity
        // we're just checking for 13.0.1 and above to avoid a 13.0.0 bug. 12.1
        // will fail the isDisplayMediaAccessible() check anyway.
        safari: ">=13.0.1",
        edge: ">=79",   // Corresponds to Edgium
      });
    }

    function isDisplayMediaAccessible() {
      return navigator && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
    }

    const browser = Bowser.getParser(window.navigator.userAgent),
          basic = browser.getBrowser(),
          parsed = Bowser.parse(window.navigator.userAgent),
          isValidBrowser = browser.satisfies({
            electron: ">=6",
            chromium: ">=61",
            chrome: ">=61",
            firefox: ">=63",
            opera: ">=61",
            safari: ">=12",
            edge: ">=18",
            iOS: {
              chromium: "<0",
              chrome: "<0",
              firefox: "<0",
              opera: "<0",
              safari: ">=12",
              edge: "<0",
            }
          }),
        // See PluotUtil.isScreenSharingSupported() for a thorough explanation of this check
        supportsScreenShare = !!(isValidBrowser && isDisplayMediaAccessible() && supportsUnifiedPlanSDP(browser)),
        supportsSfu = !!(isValidBrowser && !browser.satisfies({edge: '<=18'}));

    return {
      supported: isValidBrowser,
      mobile: parsed.platform.type === 'mobile',
      name: basic.name,
      version: basic.version,
      supportsScreenShare,
      supportsSfu,
      // basic, parsed
    };
  }

  //
  // constructors
  //

  static createCallObject(properties={}) {
    properties.layout = 'none';
    return new DailyIframe(null, properties);
  }

  static wrap(iframeish, properties={}) {
    if (!iframeish || !iframeish.contentWindow ||
        ('string' !== typeof iframeish.src)) {
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
          bottom: '1em'
        };
      } else {
        iframeStyle = {
          border: 0,
          width: '100%',
          height: '100%'
        }
      }
    }
    let iframeEl = document.createElement('iframe');
    // special-case for old Electron for Figma
    if (window.navigator &&
        window.navigator.userAgent.match(/Chrome\/61\./)) {
      iframeEl.allow = 'microphone, camera';
    } else {
      iframeEl.allow = 'microphone; camera; autoplay';
    }
    iframeEl.style.visibility = 'hidden';
    parentEl.appendChild(iframeEl);
    iframeEl.style.visibility = null;
    Object.keys(iframeStyle).forEach((k) => iframeEl.style[k] = iframeStyle[k]);
    if (!properties.layout) {
      if (properties.customLayout) {
        properties.layout = 'custom-v1';
      } else {
        properties.layout = 'browser';
      }
    }
    return new DailyIframe(iframeEl, properties);
  }

  static createTransparentFrame(properties={}) {
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

  constructor(iframeish, properties={}) {
    super();
    this._iframe = iframeish;
    this._callObjectMode = (properties.layout === 'none' && !this._iframe);
    this._preloadCache = initializePreloadCache();
    if (this._callObjectMode) {
      window._dailyPreloadCache = this._preloadCache;
    }

    this.validateProperties(properties);
    this.properties = { ...properties };
    this._loaded = false;
    this._callObjectScriptLoaded = false;
    this._meetingState = DAILY_STATE_NEW;
    this._participants = {};
    this._inputEventsOn = {}; // need to cache these until loaded
    this._network = { threshold: 'good', quality: 100 };
    this._activeSpeaker = {};
    this._activeSpeakerMode = false;
    this._messageCallbacks = {};
    this._callFrameId = Date.now() + Math.random().toString();

    this._messageListener = (evt) => {
      if (evt.data && evt.data.what === 'iframe-call-message' &&
          // make callFrameId addressing backwards-compatible with
          // old versions of the library, which didn't have it
          (evt.data.callFrameId ?
           evt.data.callFrameId === this._callFrameId : true) &&
          (evt.data.from ? evt.data.from !== 'module' : true)) {
        // console.log('handling module message', evt.data);
        delete evt.data.from;
        this.handleMessage(evt.data);
      }
    }

    // fullscreen event listener
    if (this._iframe) {
      if (this._iframe.requestFullscreen) {
        // chrome (not safari)
        this._iframe.addEventListener('fullscreenchange', (e) => {
          if (document.fullscreenElement === this._iframe) {
            this.emit(DAILY_EVENT_FULLSCREEN);
            this._sendIframeMsg({ action: DAILY_EVENT_FULLSCREEN });
          } else {
            this.emit(DAILY_EVENT_EXIT_FULLSCREEN);
            this._sendIframeMsg({ action: DAILY_EVENT_EXIT_FULLSCREEN });
          }
        });
      } else if (this._iframe.webkitRequestFullscreen) {
        // safari
        this._iframe.addEventListener('webkitfullscreenchange', (e) => {
          if (document.webkitFullscreenElement === this._iframe) {
            this.emit(DAILY_EVENT_FULLSCREEN);
            this._sendIframeMsg({ action: DAILY_EVENT_FULLSCREEN });
          } else {
            this.emit(DAILY_EVENT_EXIT_FULLSCREEN);
            this._sendIframeMsg({ action: DAILY_EVENT_EXIT_FULLSCREEN });
          }
        });
      }
    }

    window.addEventListener('message', this._messageListener);
  }

  //
  // instance methods
  //

  async destroy() {
    try { 
      if (this._meetingState === 'joined-meeting') {
        await this.leave();
      }
    } catch (e) {}
    let iframe = this.iframe();
    if (iframe) {
      let parent = iframe.parentElement;
      if (parent) {
        parent.removeChild(iframe);
      }
    }
    window.removeEventListener('message', this._messageListener);
  }

  loadCss({ bodyClass, cssFile, cssText }) {
    this._sendIframeMsg({ action: DAILY_METHOD_LOAD_CSS,
                          cssFile: this.absoluteUrl(cssFile),
                          bodyClass, cssText });
    return this;
  }

  iframe() {
    return this._iframe;
  }

  meetingState() {
    return this._meetingState;
  }

  participants() {
    return this._participants;
  }

  updateParticipant(sessionId, properties) {
    if (this._participants.local &&
        this._participants.local.session_id === sessionId) {
      sessionId = 'local';
    }
    if (sessionId && properties && this._participants[sessionId]) {
      for (var prop in properties) {
        if (!PARTICIPANT_PROPS[prop]) {
          throw new Error
            (`unrecognized updateParticipant property ${prop}`);
        }
        if (PARTICIPANT_PROPS[prop].validate) {
          if (!PARTICIPANT_PROPS[prop].validate(properties[prop])) {
            throw new Error(PARTICIPANT_PROPS[prop].help);
          }
        }
      }
      this._sendIframeMsg({ action: DAILY_METHOD_UPDATE_PARTICIPANT,
                            id: sessionId, properties});
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
    this._sendIframeMsg({ action: DAILY_METHOD_LOCAL_AUDIO, state: bool });
    return this;
  }

  setLocalVideo(bool) {
    this._sendIframeMsg({ action: DAILY_METHOD_LOCAL_VIDEO, state: bool });
    return this;
  }

  setBandwidth({ kbs, trackConstraints }) {
    this._sendIframeMsg({ action: DAILY_METHOD_SET_BANDWIDTH,
                          kbs, trackConstraints });
    return this;    
  }

  setDailyLang(lang) {
    this._sendIframeMsg({ action: DAILY_METHOD_SET_LANG, lang });
  }

  startCamera(properties={}) {
    return new Promise(async (resolve, reject) => {
      let k = (msg) => {
        delete msg.action;
        delete msg.callbackStamp;
        resolve(msg);
      };
      if (!this._loaded) {
        await this.load(properties);
      }
      this._sendIframeMsg({
        action: DAILY_METHOD_START_CAMERA,
        properties: makeSafeForPostMessage(this.properties),
      }, k);
    });
    return this;
  }

  cycleCamera() {
    return new Promise((resolve, reject) => {
      let k = (msg) => {
        resolve({ device: msg.device });
      };
      this._sendIframeMsg({ action: DAILY_METHOD_CYCLE_CAMERA }, k);
    });
  }

  cycleMic() {
    return new Promise((resolve, reject) => {
      let k = (msg) => {
        resolve({ device: msg.device });
      };
      this._sendIframeMsg({ action: DAILY_METHOD_CYCLE_MIC }, k);
    });
  }

  setInputDevices({ audioDeviceId, videoDeviceId, audioSource, videoSource }) {
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
      return this;
    }

    if (audioDeviceId instanceof MediaStreamTrack) {
      audioDeviceId = DAILY_CUSTOM_TRACK;
    }
    if (videoDeviceId instanceof MediaStreamTrack) {
      videoDeviceId = DAILY_CUSTOM_TRACK;
    }

    this._sendIframeMsg({ action: DAILY_METHOD_SET_INPUT_DEVICES,
                          audioDeviceId, videoDeviceId });
    return this;
  }

  setOutputDevice({ outputDeviceId }) {
    // cache this for use later
    if (outputDeviceId) {
      this._preloadCache.outputDeviceId = outputDeviceId;
    }

    // if we're in callObject mode and not joined yet, don't do anything
    if (this._callObjectMode && this._meetingState !== DAILY_STATE_JOINED) {
      return this;
    }

    this._sendIframeMsg({ action: DAILY_METHOD_SET_OUTPUT_DEVICE,
                          outputDeviceId });
    return this;    
  }

  getInputDevices() {
    if (this._callObjectMode && this._meetingState !== DAILY_STATE_JOINED) {
      return {
        camera: { deviceId: this._preloadCache.videoDeviceId },
        mic: { deviceId: this._preloadCache.audioDeviceId },
        speaker: { deviceId: this._preloadCache.outputDeviceId }
      }
    }

    return new Promise((resolve, reject) => {
      let k = (msg) => {
        delete msg.action;
        delete msg.callbackStamp;
        resolve(msg);
      };
      this._sendIframeMsg({ action: DAILY_METHOD_GET_INPUT_DEVICES }, k);
    });
  }

  async load(properties) {
    if (properties) {
      this.validateProperties(properties);
      this.properties = { ...this.properties, ...properties };
    }
    if (!this.properties.url) {
      throw new Error("can't load meeting because url property isn't set");
    }
    this._meetingState = DAILY_STATE_LOADING;
    try {
      this.emit(DAILY_EVENT_LOADING, { action: DAILY_EVENT_LOADING });
    } catch (e) {
      console.log("could not emit 'loading'");
    }

    // non-iframe, callObjectMode ... load call-machine using script tag
    if (this._callObjectMode) {
      return new Promise((resolve, reject) => {
        if (!document) {
          console.error('need to create call object in a DOM/web context');
          return;
        }
        if (this._callObjectScriptLoaded) {
          window._dailyCallObjectSetup();
          this._loaded = true;
          this._meetingState = DAILY_STATE_LOADED;
          this.emit(DAILY_EVENT_LOADED, { action: DAILY_EVENT_LOADED });
          resolve();
        } else {
          const head = document.getElementsByTagName('head')[0],
                script = document.createElement('script');
          script.onload = async () => {
            this._callObjectScriptLoaded = true;
            this._loaded = true;
            this._meetingState = DAILY_STATE_LOADED;
            resolve();
          }
          // Use the CDN to get call-machine-object (but use whatever's "local" for dev+staging)
          if (process.env.NODE_ENV === 'production') {
            if (!DailyIframe.supportedBrowser().supportsSfu) {
              script.src = `https://c.daily.co/static/call-machine-object-nosfu-bundle.js`;
            } else {
              script.src = `https://c.daily.co/static/call-machine-object-bundle.js`;
            }
          } else {
            let url = new URL(this.properties.url);
            if (!DailyIframe.supportedBrowser().supportsSfu) {
              script.src = `${url.origin}/static/call-machine-object-nosfu-bundle.js`;
            } else {
              script.src = `${url.origin}/static/call-machine-object-bundle.js`;
            }
          }
          head.appendChild(script);
        }
      });

    // iframe ... load call in iframe
    } else {
      this._iframe.src = this.assembleMeetingUrl();
      return new Promise((resolve, reject) => {
        this._loadedCallback = () => {
          this._loaded = true;
          this._meetingState = DAILY_STATE_LOADED;
          if (this.properties.cssFile || this.properties.cssText) {
            this.loadCss(this.properties);
          }
          for (let eventName in this._inputEventsOn) {
            this._sendIframeMsg({ action: DAILY_METHOD_REGISTER_INPUT_HANDLER,
                                  on: eventName });
          }
          resolve();
        }
      });
    }
  }
    
  async join(properties={}) {
    let newCss = false;
    if (!this._loaded) {
      await this.load(properties);
    } else {
      newCss = !!(this.properties.cssFile || this.properties.cssText)
      if (properties.url &&
          properties.url !== this.properties.url) {
        console.error("error: can't change the daily.co call url after load()");
        return Promise.reject();
      }
    }
    if (this._meetingState === DAILY_STATE_JOINED ||
        this._meetingState === DAILY_STATE_JOINING) {
      console.warn('already joined meeting, call leave() before joining again');
      return;
    }
    this._meetingState = DAILY_STATE_JOINING;
    try {
      this.emit(DAILY_EVENT_JOINING_MEETING,
                { action: DAILY_EVENT_JOINING_MEETING });
    } catch (e) {
      console.log("could not emit 'joining-meeting'");
    }
    this._sendIframeMsg({
      action: DAILY_METHOD_JOIN,
      properties: makeSafeForPostMessage(this.properties),
      preloadCache: makeSafeForPostMessage(this._preloadCache),
    });
    return new Promise((resolve, reject) => {
      this._joinedCallback = (participants) => {
        this._meetingState = DAILY_STATE_JOINED;
        if (participants) {
          for (var id in participants) {
            this.fixupParticipant(participants[id]);
            let lid = participants[id].local ? 'local' : 
                                               participants[id].session_id;
            this.matchParticipantTracks(lid, participants[id]);
            this._participants[id] = { ...participants[id] };
          }
        }
        if (newCss) {
          this.loadCss(this.properties);
        }
        resolve(participants);
      }
    })
  }

  async leave() {
    return new Promise((resolve, reject) => {
      let k = () => {
        if (this._iframe) {
          // resetting the iframe src maybe interferes with sending the
          // ks beacon?
          // this._iframe.src = '';
        }
        this._loaded = false;
        this._meetingState = DAILY_STATE_LEFT;
        this._participants = {};
        this._activeSpeakerMode = false;
        resetPreloadCache(this._preloadCache);
        try {
          this.emit(DAILY_STATE_LEFT, { action: DAILY_STATE_LEFT });
        } catch (e) {
          console.log("could not emit 'left-meeting'");
        }
        resolve();
      }
      this._sendIframeMsg({ action: DAILY_METHOD_LEAVE }, k);
    });
  }

  startScreenShare(captureOptions={}) {
    if (captureOptions.mediaStream) {
      this._preloadCache.screenMediaStream = captureOptions.mediaStream;
      captureOptions.mediaStream = DAILY_CUSTOM_TRACK;
    }
    this._sendIframeMsg({ action: DAILY_METHOD_START_SCREENSHARE,
                          captureOptions });
  }

  stopScreenShare() {
    this._sendIframeMsg({ action: DAILY_METHOD_STOP_SCREENSHARE });    
  }

  startRecording() {
    this._sendIframeMsg({ action: DAILY_METHOD_START_RECORDING });
  }

  stopRecording() {
    this._sendIframeMsg({ action: DAILY_METHOD_STOP_RECORDING });
  }

  getNetworkStats() {
    if (this._meetingState !== DAILY_STATE_JOINED) {
      let stats = { latest: {} };
      return { stats };
    }
    return new Promise((resolve, reject) => {
      let k = (msg) => {
        resolve({ stats: msg.stats, ...this._network });
      }
      this._sendIframeMsg({ action: DAILY_METHOD_GET_CALC_STATS }, k);
    });
  }

  getActiveSpeaker() {
    return this._activeSpeaker;
  }

  setActiveSpeakerMode(enabled) {
    this._sendIframeMsg({ action: DAILY_METHOD_SET_ACTIVE_SPEAKER_MODE, enabled });
    return this;
  }

  activeSpeakerMode() {
    return this._activeSpeakerMode;
  }

  async enumerateDevices(kind) {
    if (this._callObjectMode) {
      let raw = await navigator.mediaDevices.enumerateDevices();
      return { devices: raw.map((d) => JSON.parse(JSON.stringify(d))) };
    }

    return new Promise((resolve, reject) => {
      let k = (msg) => {
        resolve({ devices: msg.devices });
      }
      this._sendIframeMsg({ action: DAILY_METHOD_ENUMERATE_DEVICES, kind }, k);
    });    
  }

  sendAppMessage(data, to='*') {
    if (JSON.stringify(data).length > MAX_APP_MSG_SIZE) {
      throw new Error('Message data too large. Max size is ' +
                      MAX_APP_MSG_SIZE);
    }
    this._sendIframeMsg({ action: DAILY_METHOD_APP_MSG, data, to });
    return this;
  }

  addFakeParticipant(args) {
    this._sendIframeMsg({ action: DAILY_METHOD_ADD_FAKE_PARTICIPANT, ...args });
    return this;
  }

  setShowNamesMode(mode) {
    if (mode && !(mode === 'always' || mode === 'never')) {
      console.error(
        'setShowNamesMode argument should be "always", "never", or false'
      );
      return this;
    }
    this._sendIframeMsg({ action: DAILY_METHOD_SET_SHOW_NAMES, mode: mode })
    return this;
  }

  detectAllFaces() {
    return new Promise((resolve, reject) => {
      let k = (msg) => {
        delete msg.action;
        delete msg.callbackStamp;
        resolve(msg);
      };
      this._sendIframeMsg({ action: DAILY_METHOD_DETECT_ALL_FACES }, k);
    });
  }

  async requestFullscreen() {
    if (!this._iframe || document.fullscreenElement) {
      return;
    }
    try {
      await this._iframe.requestFullscreen ?
              this._iframe.requestFullscreen() :
              this._iframe.webkitRequestFullscreen();
    } catch (e) {
      console.log('could not make video call fullscreen', e);
    }
  }

  exitFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (document.webkitFullscreenElement) {
      document.webkitExitFullscreen();
    }
  }

  async room() {
    if (this._meetingState !== DAILY_STATE_JOINED) {
      return null;
    }
    return new Promise((resolve, reject) => {
      let k = (msg) => {
        delete msg.action;
        delete msg.callbackStamp;
        resolve(msg);
      };
      this._sendIframeMsg({ action: DAILY_METHOD_ROOM }, k);
    });
  }

  async geo() {
    return new Promise(async (resolve, reject) => {
      try {
        let url = 'https://gs.daily.co/_ks_/x-swsl/:';
        let res = await fetch(url);
        let data = await res.json();
        resolve( { current: data.geo } );
      } catch (e) {
        console.error('geo lookup failed', e);
        resolve({ current: '' } );
      }
    });
  }

  async setNetworkTopology(opts) {
    return new Promise(async (resolve, reject) => {
      let k = (msg) => {
        if (msg.error) {
          reject({ error: msg.error });
        } else {
          resolve({ workerId: msg.workerId });
        }
      };
      this._sendIframeMsg({ action: DAILY_METHOD_SET_NETWORK_TOPOLOGY,
                            opts }, k);
    });
  }

  setPlayNewParticipantSound(arg) {
    if (!(typeof arg === 'number' ||
          arg === true ||
          arg === false)) {
      throw new Error(`argument to setShouldPlayNewParticipantSound should be true, false, or a number, but is ${arg}`);
    }
    this._sendIframeMsg({ action: DAILY_METHOD_SET_PLAY_DING, arg });
  }

  //
  // internal methods
  //

  validateProperties(properties) {
    for (var k in properties) {
      if (!FRAME_PROPS[k]) {
        throw new Error(`unrecognized property '${k}'`);
      }
      if (FRAME_PROPS[k].validate &&
          !FRAME_PROPS[k].validate(properties[k], this)) {
        throw new Error(`property '${k}': ${FRAME_PROPS[k].help}`);
      }
    }
  }

  assembleMeetingUrl() {
    // handle case of url with query string and without
    let props = {
      ...this.properties,
      emb: this._callFrameId,
      embHref: encodeURIComponent(window.location.href)
    },
        firstSep = (props.url.match(/\?/)) ? '&' : '?',
        url = props.url,
        urlProps = Object.keys(FRAME_PROPS).filter((p) =>
          FRAME_PROPS[p].queryString && (props[p] !== undefined)
        );
    let newQueryString = urlProps
          .map((p) => `${FRAME_PROPS[p].queryString}=${props[p]}`)
          .join('&');
    return url + firstSep + newQueryString;
  }

  _sendIframeMsg(message, callback) {
    let msg = { ...message };
    msg.what = IFRAME_MESSAGE_MARKER;
    msg.from = 'module';
    msg.callFrameId = this._callFrameId;
    if (callback) {
      let ts = Date.now();
      this._messageCallbacks[ts] = callback;
      msg.callbackStamp = ts;
    }
    const w = this._iframe ? this._iframe.contentWindow : window;
    // console.log('sending', msg);
    w.postMessage(msg, '*');
  }

  handleMessage(msg) {
    // messages could be completely handled by callbacks
    if (msg.callbackStamp && this._messageCallbacks[msg.callbackStamp]) {
      this._messageCallbacks[msg.callbackStamp].call(this, msg);
      delete this._messageCallbacks[msg.callbackStamp];
    }
    // or perhaps we should handle this message based on its
    // msg.action tag. first we'll delete internal fields so the
    // 'case' code blocks have the option of just emitting the raw
    // message as an event
    delete msg.what;
    delete msg.callbackStamp;
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
        if (this._meetingState === 'left-meeting') {
          return;
        }
        this.fixupParticipant(msg);
        if (msg.participant && msg.participant.session_id) {
          let id = msg.participant.local ? 'local' : msg.participant.session_id;
          this.matchParticipantTracks(id, msg.participant);
          // track events
          try {
            this.maybeEventTrackStopped(this._participants[id], msg.participant,
                                        'audioTrack');
            this.maybeEventTrackStopped(this._participants[id], msg.participant,
                                        'videoTrack');
            this.maybeEventTrackStopped(this._participants[id], msg.participant,
                                        'screenVideoTrack');
            this.maybeEventTrackStarted(this._participants[id], msg.participant,
                                        'audioTrack');
            this.maybeEventTrackStarted(this._participants[id], msg.participant,
                                        'videoTrack');
            this.maybeEventTrackStarted(this._participants[id], msg.participant,
                                        'screenVideoTrack');
          } catch (e) {
            console.error('track events error', e);
          }
          // participant joined/updated events
          if (!this.compareEqualForParticipantUpdateEvent(
                msg.participant, this._participants[id])
             ) {
            this._participants[id] = { ...msg.participant };
            try {
              this.emit(msg.action, msg);
            } catch (e) {
              console.log('could not emit', msg);
            }
          }
        }
        break;
      case DAILY_EVENT_PARTICIPANT_LEFT:
        this.fixupParticipant(msg);
        if (msg.participant && msg.participant.session_id) {
          // track events
          let prevP = this._participants[msg.participant.session_id];
          if (prevP) {
            this.maybeEventTrackStopped(prevP, null, 'audioTrack');
            this.maybeEventTrackStopped(prevP, null, 'videoTrack');
            this.maybeEventTrackStopped(prevP, null, 'screenVideoTrack');
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
        this._loaded = false;
        this._meetingState = DAILY_STATE_ERROR;
        try {
          this.emit(msg.action, msg);
        } catch (e) {
          console.log('could not emit', msg);
        }
        break;
      case DAILY_EVENT_LEFT_MEETING:
        if (this._meetingState !== DAILY_STATE_ERROR) {
          this._meetingState = DAILY_STATE_LEFT;
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
          this.emit(msg.event.type, { action: msg.event.type,
                                      event: msg.event,
                                      participant: {...p} });
        } catch (e) {
          console.log('could not emit', msg);
        }
        break;
      case DAILY_EVENT_NETWORK_QUALITY_CHANGE:
        let { threshold, quality } = msg;
        if (threshold !== this._network.threshold ||
            quality !== this._network.quality) {
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
            this.emit(msg.action, { action: msg.action,
                                    activeSpeaker: this._activeSpeaker });
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
            this.emit(msg.action, { action: msg.action,
                                    enabled: this._activeSpeakerMode });
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
        try {
          this.emit(msg.action, msg);
        } catch (e) {
          console.log('could not emit', msg);
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

  // fix this later to be a no-op
  fixupParticipant(msgOrP) {
    let p = msgOrP.participant ? msgOrP.participant : msgOrP;
    if (!p.id) {
      return;
    }
    p.owner = !!p.owner;
    p.session_id = p.id;
    p.user_name = p.name;
    p.joined_at = p.joinedAt;
    delete p.id;
    delete p.name;
    delete p.joinedAt;
  }

  matchParticipantTracks(id, p) {
    if (!this._callObjectMode) {
      return;
    }
    let state = store.getState();

    if (id === 'local') {
      if (p.audio) {
        try {
          p.audioTrack = state.local.streams.cam.stream.
            getAudioTracks()[0];
          if (!p.audioTrack) { p.audio = false };
        } catch (e) {}
      }
      if (p.video) {
        try {
          p.videoTrack = state.local.streams.cam.stream.
            getVideoTracks()[0];
          if (!p.videoTrack) { p.video = false };
        } catch (e) {}
      }
      if (p.screen) {
        try {
          p.screenVideoTrack = state.local.streams.screen.stream.
            getVideoTracks()[0];
          if (!p.screenVideoTrack) { p.screen = false };
        } catch (e) {}
      }
      return;
    }

    let connected = true; // default to true to minimize impact of new bugs
                          // as of 11/20/2019 when this block of code was
                          // first written
    try {
      let sp = state.participants[p.session_id];
      if (sp && sp.public.rtcType.impl === 'peer-to-peer') {
        if (sp.private && !['connected', 'completed'].includes(sp.private.peeringState)) {
          connected = false;
        }
      }
    } catch (e) {
      console.error(e)
    }
    if (!connected) {
      p.audio = false;
      p.audioTrack = false;
      p.video = false;
      p.videoTrack = false;
      p.screen = false;
      p.screenTrack = false;
      return;
    }

    try {
      const allStreams = state.streams,
            prevP = this._participants[p.session_id];

      // find audio track
      if (p.audio) {
        let audioTracks = orderBy(filter(allStreams, (s) => (
          s.participantId === p.session_id &&
            s.type === 'cam' &&
            s.pendingTrack && s.pendingTrack.kind === 'audio'
        )), 'starttime', 'desc');
        if (audioTracks && audioTracks[0] && audioTracks[0].pendingTrack) {
          if (prevP && prevP.audioTrack &&
              prevP.audioTrack.id === audioTracks[0].pendingTrack.id) {
            // if we have an apparently identical audio track already in
            // our participant struct leave it in place to avoid flicker
            // during quick muted/unmuted PeerConnection cycles. we'll update
            // audio/video muted at the app level via signaling
            p.audioTrack = audioTracks[0].pendingTrack;
          } else if (!audioTracks[0].pendingTrack.muted) {
            // otherwise, add the found track if it's not muted
            p.audioTrack = audioTracks[0].pendingTrack;
          }
        }
        if (!p.audioTrack) { p.audio = false };
      }
      // find video track
      if (p.video) {
        let videoTracks = orderBy(filter(allStreams, (s) => (
          s.participantId === p.session_id &&
            s.type === 'cam' &&
            s.pendingTrack && s.pendingTrack.kind === 'video'
        )), 'starttime', 'desc');
        if (videoTracks && videoTracks[0] && videoTracks[0].pendingTrack) {
          if (prevP && prevP.videoTrack &&
              prevP.videoTrack.id === videoTracks[0].pendingTrack.id) {
            p.videoTrack = videoTracks[0].pendingTrack;
          } else if (!videoTracks[0].pendingTrack.muted) {
            // otherwise, add the found track if it's not muted
            p.videoTrack = videoTracks[0].pendingTrack;
          }
        }
        if (!p.videoTrack) { p.video = false };
      }
      // find screen-share video track
      if (p.screen) {
        let screenVideoTracks = orderBy(filter(allStreams, (s) => (
          s.participantId === p.session_id &&
            s.type === 'screen' &&
            s.pendingTrack && s.pendingTrack.kind === 'video'
        )), 'starttime', 'desc');
        if (screenVideoTracks && screenVideoTracks[0] &&
            screenVideoTracks[0].pendingTrack) {
          if (prevP && prevP.screenVideoTrack &&
              prevP.screenVideoTrack.id ===
                screenVideoTracks[0].pendingTrack.id) {
            p.screenVideoTrack = screenVideoTracks[0].pendingTrack;
          } else if (!screenVideoTracks[0].pendingTrack.muted) {
            // otherwise, add the found track if it's not muted
            p.screenVideoTrack = screenVideoTracks[0].pendingTrack;
          }
        }
        if (!p.screenVideoTrack) { p.screen = false };
      }
    } catch (e) {
      console.error('unexpected error matching up tracks', e);
    }
  }

  maybeEventTrackStopped(prevP, thisP, key) {
    if (!prevP) {
      return;
    }
    if ((prevP[key] && (prevP[key].readyState === 'ended')) ||
        (prevP[key] && !(thisP && thisP[key])) ||
        (prevP[key] && (prevP[key].id !== thisP[key].id))) {
      try {
        this.emit(DAILY_EVENT_TRACK_STOPPED,
                  { action: DAILY_EVENT_TRACK_STOPPED,
                    track: prevP[key],
                    participant: thisP });
      } catch (e) {
        console.log('could not emit', e);
      }
    }
  }

  maybeEventTrackStarted(prevP, thisP, key) {
    if ((thisP[key] && !(prevP && prevP[key])) ||
        (thisP[key] && (prevP[key].readyState === 'ended')) ||
        (thisP[key] && (thisP[key].id !== prevP[key].id))) {
      try {
        this.emit(DAILY_EVENT_TRACK_STARTED,
                  { action: DAILY_EVENT_TRACK_STARTED,
                    track: thisP[key],
                    participant: thisP });
      } catch (e) {
        console.log('could not emit', e);
      }
    }
  }

  compareEqualForParticipantUpdateEvent(a, b) {
    if (!deepEqual(a, b)) {
      return false;
    }
    if (a.videoTrack && b.videoTrack &&
        (a.videoTrack.id !== b.videoTrack.id ||
         a.videoTrack.muted !== b.videoTrack.muted ||
         a.videoTrack.enabled !== b.videoTrack.enabled)) {
      return false;
    }
    if (a.audioTrack && b.audioTrack &&
        (a.audioTrack.id !== b.audioTrack.id ||
         a.audioTrack.muted !== b.audioTrack.muted ||
         a.audioTrack.enabled !== b.audioTrack.enabled)) {
      return false;
    }
    return true;
  }

  absoluteUrl(url) {
    if ('undefined' === typeof url) {
      return undefined;
    }
    let a = document.createElement('a');
		a.href = url;
		return a.href;
  }

  on(eventName, k) {
    this._inputEventsOn[eventName] = {};
    this._sendIframeMsg({ action: DAILY_METHOD_REGISTER_INPUT_HANDLER,
                          on: eventName });
    return EventEmitter.prototype.on.call(this, eventName, k);
  }

  // todo: once is almost certainly implemented incorrectly. read the
  // EventEmitter source to figure out how to do this properly. since
  // overriding on/off/once are optimizations, anyway, we won't worry
  // about it right now.
  once(eventName, k) {
    this._inputEventsOn[eventName] = {};
    this._sendIframeMsg({ action: DAILY_METHOD_REGISTER_INPUT_HANDLER,
                          on: eventName });
    return EventEmitter.prototype.once.call(this, eventName, k);
  }

  off(eventName, k) {
    delete this._inputEventsOn[eventName];
    this._sendIframeMsg({ action: DAILY_METHOD_REGISTER_INPUT_HANDLER,
                          off: eventName });
    return EventEmitter.prototype.off.call(this, eventName, k);
  }

  sayHello() {
    const str = 'hello, world.';
    console.log(str);
    return str;
  }
};

function initializePreloadCache(callObject, properties) {
  return {
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
