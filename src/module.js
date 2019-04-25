import EventEmitter from 'events';
import { deepEqual } from 'fast-equals';

import {
  // re-export
  //
  DAILY_STATE_NEW,
  DAILY_STATE_JOINING,
  DAILY_STATE_JOINED,
  DAILY_STATE_LEFT,
  DAILY_STATE_ERROR,
  DAILY_EVENT_JOINING_MEETING,
  DAILY_EVENT_JOINED_MEETING,
  DAILY_EVENT_LEFT_MEETING,
  DAILY_EVENT_PARTICIPANT_JOINED,
  DAILY_EVENT_PARTICIPANT_UPDATED,
  DAILY_EVENT_PARTICIPANT_LEFT,

  // internals
  //
  IFRAME_MESSAGE_MARKER,
  DAILY_METHOD_LEAVE,
  DAILY_METHOD_UPDATE_PARTICIPANT,
  DAILY_METHOD_LOCAL_AUDIO,
  DAILY_METHOD_LOCAL_VIDEO,
} from './CommonIncludes.js';

export {
  DAILY_STATE_NEW,
  DAILY_STATE_JOINING,
  DAILY_STATE_JOINED,
  DAILY_STATE_LEFT,
  DAILY_STATE_ERROR,
  DAILY_EVENT_JOINING_MEETING,
  DAILY_EVENT_JOINED_MEETING,
  DAILY_EVENT_LEFT_MEETING,
};

//
//
//

const FRAME_PROPS = {
  url: {
    validate: (url) => typeof url === 'string',
    help: 'url should be a string',
  },
  token: {
    validate: (token) => typeof token === 'string',
    help: 'token should be a string',
  },
};

// todo: more validation?
const PARTICIPANT_PROPS = {
  style: true,
  setAudio: true,
  setVideo: true,
  eject: true,
};

//
//
//

export default class DailyIframe extends EventEmitter {
  constructor(iframeish, properties = {}) {
    super();
    this.validateProperties(properties);
    this.properties = { ...properties };

    this._iframe = iframeish;
    this._meetingState = DAILY_STATE_NEW;
    this._participants = {};

    this._messageCallbacks = {};

    window.addEventListener('message', (evt) => {
      if (evt.data && evt.data.what === 'iframe-call-message') {
        this.handleMessage(evt.data);
      }
    });
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

  // properties
  //   style ?
  //   setAudio
  //   setVideo
  //   eject
  updateParticipant(id, properties) {
    if (id && properties && this._participants[id]) {
      for (var prop in properties) {
        if (!PARTICIPANT_PROPS[prop]) {
          throw new Error(`unrecognized updateParticipant property ${prop}`);
        }
      }
      this.sendMessage({
        action: DAILY_METHOD_UPDATE_PARTICIPANT,
        id,
        properties,
      });
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
    this.sendMessage({ action: DAILY_METHOD_LOCAL_AUDIO, state: bool });
    return this;
  }

  setLocalVideo(bool) {
    this.sendMessage({ action: DAILY_METHOD_LOCAL_VIDEO, state: bool });
    return this;
  }

  async join(properties) {
    if (properties) {
      this.validateProperties(properties);
      this.properties = { ...this.properties, ...properties };
    }
    if (!this.properties.url) {
      throw new Error("can't join meeting because url property isn't set");
    }
    this._meetingState = DAILY_STATE_JOINING;
    this.emit(DAILY_EVENT_JOINING_MEETING, {
      action: DAILY_EVENT_JOINING_MEETING,
    });
    this._iframe.src = this.properties.url;
    return new Promise((resolve, reject) => {
      this._joinedCallback = (participants) => {
        if (participants) {
          this._participants = participants;
        }
        resolve(participants);
      };
    });
  }

  async leave() {
    return new Promise((resolve, reject) => {
      let k = () => {
        this._iframe.src = '';
        this._meetingState = DAILY_STATE_LEFT;
        this.emit(DAILY_STATE_LEFT, { action: DAILY_STATE_LEFT });
        resolve();
      };
      this.sendMessage({ action: DAILY_METHOD_LEAVE }, k);
    });
  }

  //
  // internal methods
  //

  validateProperties(properties) {
    for (var k in properties) {
      if (!FRAME_PROPS[k]) {
        throw new Error(`unrecognized property '${k}'`);
      }
      if (!FRAME_PROPS[k].validate(properties[k])) {
        throw new Error(`unrecognized property '${k}'`);
      }
    }
  }

  sendMessage(message, callback) {
    let msg = { ...message };
    msg.what = IFRAME_MESSAGE_MARKER;
    if (callback) {
      let ts = Date.now();
      this._messageCallbacks[ts] = callback;
      msg.callbackStamp = ts;
    }
    this._iframe.contentWindow.postMessage(msg, '*');
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
      case DAILY_EVENT_JOINED_MEETING:
        if (this._joinedCallback) {
          this._joinedCallback(msg.participants);
          this._joinedCallback = null;
        }
        this.emit(msg.action, msg);
        this._meetingState = DAILY_STATE_JOINED;
        break;
      case DAILY_EVENT_PARTICIPANT_JOINED:
      case DAILY_EVENT_PARTICIPANT_UPDATED:
        if (msg.participant && msg.participant.id) {
          let id = msg.participant.local ? 'local' : msg.participant.id;
          if (!deepEqual(msg.participant, this._participants[id])) {
            this._participants[id] = msg.participant;
            this.emit(msg.action, msg);
          }
        }
        break;
      case DAILY_EVENT_PARTICIPANT_LEFT:
        if (msg.participant && msg.participant.id) {
          delete this._participants[msg.participant.id];
          this.emit(msg.action, msg);
        }
        break;
      default: // no op
    }
  }

  sayHello() {
    const str = 'hello, world.';
    console.log(str);
    return str;
  }

  static wrap(iframeish, properties = {}) {
    if (
      !iframeish ||
      !iframeish.contentWindow ||
      'string' !== typeof iframeish.src
    ) {
      throw new Error('DailyIframe::Wrap needs an iframe-like first argument');
    }
    return new DailyIframe(iframeish, properties);
  }
}
