import ScriptMessageChannel from './ScriptMessageChannel';
import { IFRAME_MESSAGE_MARKER } from '../CommonIncludes';

/**
 * A two-way message channel between daily-js and the call machine (pluot-core),
 * when running in a web context (in a browser or Electron).
 */
export default class WebMessageChannel extends ScriptMessageChannel {
  constructor() {
    super();
    this._wrappedListeners = {}; // Mapping between listeners and wrapped listeners
    this._messageCallbacks = {};
  }

  addListenerForMessagesFromCallMachine(listener, callFrameId, thisValue) {
    const wrappedListener = (evt) => {
      if (
        evt.data &&
        evt.data.what === 'iframe-call-message' &&
        // make callFrameId addressing backwards-compatible with
        // old versions of the library, which didn't have it
        (evt.data.callFrameId ? evt.data.callFrameId === callFrameId : true) &&
        (evt.data.from ? evt.data.from !== 'module' : true)
      ) {
        const msg = evt.data;
        // console.log('[WebMessageChannel] received call machine message', msg);
        delete msg.from;
        // messages could be completely handled by callbacks
        if (msg.callbackStamp && this._messageCallbacks[msg.callbackStamp]) {
          // console.log('[WebMessageChannel] handling message as callback', msg);
          const callbackStamp = msg.callbackStamp; // Storing here since the callback could delete msg.callbackStamp
          this._messageCallbacks[callbackStamp].call(thisValue, msg);
          delete this._messageCallbacks[callbackStamp];
        }
        // or perhaps we should handle this message based on its
        // msg.action tag. first we'll delete internal fields so the
        // listener function has the option of just emitting the raw
        // message as an event
        delete msg.what;
        delete msg.callbackStamp;
        listener.call(thisValue, msg);
      }
    };
    this._wrappedListeners[listener] = wrappedListener;
    window.addEventListener('message', wrappedListener);
  }

  addListenerForMessagesFromDailyJs(listener, callFrameId, thisValue) {
    const wrappedListener = (evt) => {
      if (
        !(
          evt.data &&
          evt.data.what === IFRAME_MESSAGE_MARKER &&
          evt.data.action &&
          (!evt.data.from || evt.data.from === 'module') &&
          (evt.data.callFrameId && callFrameId
            ? evt.data.callFrameId === callFrameId
            : true)
        )
      ) {
        return;
      }
      const msg = evt.data;
      // console.log('[WebMessageChannel] received daily-js message', msg);
      listener.call(thisValue, msg);
    };
    this._wrappedListeners[listener] = wrappedListener;
    window.addEventListener('message', wrappedListener);
  }

  sendMessageToCallMachine(message, callback, iframe, callFrameId) {
    let msg = { ...message };
    msg.what = IFRAME_MESSAGE_MARKER;
    msg.from = 'module';
    msg.callFrameId = callFrameId;
    if (callback) {
      let ts = Date.now();
      this._messageCallbacks[ts] = callback;
      msg.callbackStamp = ts;
    }
    const w = iframe ? iframe.contentWindow : window;
    // console.log('[WebMessageChannel] sending message to call machine', msg);
    w.postMessage(msg, '*');
  }

  sendMessageToDailyJs(message, isCallObject, callFrameId) {
    message.what = IFRAME_MESSAGE_MARKER;
    message.callFrameId = callFrameId;
    message.from = 'embedded';
    const w = isCallObject ? window : window.parent;
    // console.log('[WebMessageChannel] sending message to daily-js', message);
    w.postMessage(message, '*');
  }

  removeListener(listener) {
    const wrappedListener = this._wrappedListeners[listener];
    if (wrappedListener) {
      window.removeEventListener('message', wrappedListener);
      delete this._wrappedListeners[listener];
    }
  }
}
