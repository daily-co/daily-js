import EventEmitter from 'events';

const IFRAME_MESSAGE_MARKER = 'iframe-call-message';

const FRAME_PROPS = {
  url: {
    validate: (url) => typeof url === 'string',
    help: 'url should be a string'
  },
  token: {
    validate: (token) => typeof token === 'string',
    help: 'token should be a string'
  }
};

// events:
//   joining-meeting
//   joined-meeting
//   left-meeting
//   error
//   participant-joined
//   participant-left
//   participant-state-update

// meeting states:
//   '' (newly created)
//   'joining'
//   'joined'
//   'left'
//   'error'

export default class DailyIframe extends EventEmitter {
  constructor(iframeish, properties={}) {
    super();
    this.validateProperties(properties);
    this.properties = { ...properties };
    this.iframe = iframeish;
    this.meetingState = '';
    this.messageCallbacks = {};

    window.addEventListener('message', (evt) => {
      if (evt.data && evt.data.what === 'iframe-call-message') {
        this.handleMessage(evt.data);
      }
    });
  }

  iframe() {
    return this.iframe;
  }

  meetingState() {
    return this.meetingState;
  }

  join(properties) {
    if (properties) {
      this.validateProperties(properties);
      this.properties = { ...this.properties, ...properties };
    }
    if (!this.properties.url) {
      throw new Error("can't join meeting because url property isn't set");
    }
    this.meetingState = 'joining';
    this.emit('joining');
    this.iframe.src = this.properties.url;
  }

  leave() {
    // todo: should send an event into iframe and call internal js function
    // so that beacon is sent, etc
    this.iframe.src = '';
  }

  participants() {
    return new Promise((resolve, reject) => {
      let k = (msg) => {
        resolve(msg.participants);
      }
      this.sendMessage({ action: 'participants' }, k);
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
      this.messageCallbacks[ts] = callback;
      msg.callbackStamp = ts;
    }
    this.iframe.contentWindow.postMessage(msg, '*');
  }

  handleMessage(msg) {
    if (msg.callbackStamp && this.messageCallbacks[msg.callbackStamp]) {
      this.messageCallbacks[msg.callbackStamp](msg);
    }
  }

  sayHello() {
    const str = 'hello, world.';
    console.log(str);
    return str;
  }

  static wrap(iframeish, properties={}) {
    if (!iframeish || ('string' !== typeof iframeish.src)) {
      throw new Error('DailyIframe::Wrap needs an iframe-like first argument');
    }
    return new DailyIframe(iframeish, properties);
  }
};
