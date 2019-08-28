import EventEmitter from 'events';
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
  MAX_APP_MSG_SIZE,
  DAILY_METHOD_REGISTER_INPUT_HANDLER,
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
  // style to apply to iframe in createFrame factory method
  iframeStyle: true,
  // styles passed through to video calls inside the iframe
  customLayout: true,
  cssFile: true, cssText: true, bodyClass: true,
  // used internally
  layout: {
    validate: (layout) => layout === 'custom-v1' || layout === 'browser' ||
                          layout === 'none',
    help: 'layout may only be set to "custom-v1"',
    queryString: 'layout'
  },
  emb: {
    queryString: 'emb'
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
    this.validateProperties(properties);
    this.properties = { ...properties };

    this._iframe = iframeish;
    this._loaded = false;
    this._meetingState = DAILY_STATE_NEW;
    this._participants = {};
    this._inputEventsOn = {}; // need to cache these until loaded

    this._messageCallbacks = {};
    this._callFrameId = Date.now() + Math.random().toString();

    if (properties.layout === 'none' && !this._iframe) {
      this._callObjectMode = true;
    }

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

    window.addEventListener('message', this._messageListener);
  }

  destroy() {
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

  startCamera() {
    return new Promise((resolve, reject) => {
      let k = (msg) => {
        delete msg.action;
        delete msg.callbackStamp;
        resolve(msg);
      };
      this._sendIframeMsg({ action: DAILY_METHOD_START_CAMERA }, k);
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

  setInputDevices({ audioDeviceId, videoDeviceId }) {
    this._sendIframeMsg({ action: DAILY_METHOD_SET_INPUT_DEVICES,
                          audioDeviceId, videoDeviceId });
    return this;
  }

  setOutputDevice({ outputDeviceId }) {
    this._sendIframeMsg({ action: DAILY_METHOD_SET_OUTPUT_DEVICE,
                          outputDeviceId });
    return this;    
  }

  getInputDevices() {
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
    this.emit(DAILY_EVENT_LOADING, { action: DAILY_EVENT_LOADING });

    // non-iframe, callObjectMode ... load call-machine using script tag
    if (this._callObjectMode) {
      return new Promise((resolve, reject) => {
        if (!document) {
          console.error('need to create call object in a DOM/web context');
          return;
        }
        const head = document.getElementsByTagName('head')[0],
              script = document.createElement('script');
        script.onload = async () => {
          this._loaded = true;
          this._meetingState = DAILY_STATE_LOADED;
          resolve();
        }
        let url = new URL(this.properties.url);
        script.src = `${url.origin}/static/call-machine-object-bundle.js`;
        head.appendChild(script);
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
    this._meetingState = DAILY_STATE_JOINING;
    this.emit(DAILY_EVENT_JOINING_MEETING,
              { action: DAILY_EVENT_JOINING_MEETING });
    this._sendIframeMsg({
      action: DAILY_METHOD_JOIN,
      properties: this.properties
    });
    return new Promise((resolve, reject) => {
      this._joinedCallback = (participants) => {
        this._meetingState = DAILY_STATE_JOINED;
        if (participants) {
          for (var id in participants) {
            this.fixupParticipant(participants[id]);
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
          this._iframe.src = '';
        }
        this._loaded = false;
        this._meetingState = DAILY_STATE_LEFT;
        this._participants = {};
        this.emit(DAILY_STATE_LEFT, { action: DAILY_STATE_LEFT });
        resolve();
      }
      this._sendIframeMsg({ action: DAILY_METHOD_LEAVE }, k);
    });
  }

  startScreenShare(captureOptions) {
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
    return new Promise((resolve, reject) => {
      let k = (msg) => {
        resolve({ stats: msg.stats });
      }
      this._sendIframeMsg({ action: DAILY_METHOD_GET_CALC_STATS }, k);
    });
  }

  enumerateDevices(kind) {
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

  //
  // internal methods
  //

  validateProperties(properties) {
    for (var k in properties) {
      if (!FRAME_PROPS[k]) {
        throw new Error(`unrecognized property '${k}'`);
      }
      if (FRAME_PROPS[k].validate &&
          !FRAME_PROPS[k].validate(properties[k])) {
        throw new Error(`property '${k}': ${FRAME_PROPS[k].help}`);
      }
    }
  }

  assembleMeetingUrl() {
    // handle case of url with query string and without
    let props = { ...this.properties, emb: this._callFrameId },
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
        this.emit(msg.action, msg);
        break;
      case DAILY_EVENT_JOINED_MEETING:
        if (this._joinedCallback) {
          this._joinedCallback(msg.participants);
          this._joinedCallback = null;
        }
        this.emit(msg.action, msg);
        break;
      case DAILY_EVENT_PARTICIPANT_JOINED:
      case DAILY_EVENT_PARTICIPANT_UPDATED:
        this.fixupParticipant(msg);
        if (msg.participant && msg.participant.session_id) {
          let id = msg.participant.local ? 'local' : msg.participant.session_id;
          this.matchParticipantTracks(id, msg.participant);
          if (!this.compareEqualForParticipantUpdateEvent(
                msg.participant, this._participants[id])
             ) {
            this._participants[id] = { ...msg.participant };
            this.emit(msg.action, msg);
          }
        }
        break;
      case DAILY_EVENT_PARTICIPANT_LEFT:
        this.fixupParticipant(msg);
        if (msg.participant && msg.participant.session_id) {
          delete this._participants[msg.participant.session_id];
          this.emit(msg.action, msg);
        }
        break;
      case DAILY_EVENT_ERROR:
        this._iframe.src = '';
        this._loaded = false;
        this._meetingState = DAILY_STATE_ERROR;
        this.emit(msg.action, msg);
        break;
      case DAILY_EVENT_LEFT_MEETING:
        if (this._meetingState !== DAILY_STATE_ERROR) {
          this._meetingState = DAILY_STATE_LEFT;
        }
        this.emit(msg.action, msg);
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
        this.emit(msg.event.type, { action: msg.event.type,
                                    event: msg.event,
                                    participant: {...p} });
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
        this.emit(msg.action, msg);
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

    if (id === 'local') {
      if (p.audio) {
        try {
          p.audioTrack = store.getState().local.streams.cam.stream.
            getAudioTracks()[0];
        } catch (e) {}
      }
      if (p.video) {
        try {
          p.videoTrack = store.getState().local.streams.cam.stream.
            getVideoTracks()[0];
        } catch (e) {}
      }
      if (p.screen) {
        try {
          p.screenVideoTrack = store.getState().local.streams.screen.stream.
            getVideoTracks()[0];
        } catch (e) {}
      }
      return;
    }

    const allStreams = store.getState().streams;
    // find audio track
    if (p.audio) {
      let audioTracks = orderBy(filter(allStreams, (s) => (
        s.participantId === p.session_id &&
          s.type === 'cam' &&
          s.pendingTrack && s.pendingTrack.kind === 'audio'
      )), 'starttime', 'desc');
      if (audioTracks && audioTracks[0] && audioTracks[0].pendingTrack) {
        p.audioTrack = audioTracks[0].pendingTrack;
      }
    }
    // find video track
    if (p.video) {
      let videoTracks = orderBy(filter(allStreams, (s) => (
        s.participantId === p.session_id &&
          s.type === 'cam' &&
          s.pendingTrack && s.pendingTrack.kind === 'video'
      )), 'starttime', 'desc');
      if (videoTracks && videoTracks[0] && videoTracks[0].pendingTrack) {
        p.videoTrack = videoTracks[0].pendingTrack;
      }
    }
    if (p.screen) {
      // find screen-share video track
      let screenVideoTracks = orderBy(filter(allStreams, (s) => (
        s.participantId === p.session_id &&
          s.type === 'screen' &&
          s.pendingTrack && s.pendingTrack.kind === 'video'
      )), 'starttime', 'desc');
      if (screenVideoTracks && screenVideoTracks[0] &&
          screenVideoTracks[0].pendingTrack) {
        p.screenVideoTrack = screenVideoTracks[0].pendingTrack;
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
