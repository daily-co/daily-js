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
        const msg = { ...evt.data };
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

  ///
  /// The below methods are meant to "shortcut" communication between an outer
  /// callFrame driving an inner callObject living in an intermediate iframed
  /// app, as in the new-prebuilt-UI-in-an-iframe case.
  ///

  // Expects msg to already be packaged with all internal metadata fields
  // (what, from, callFrameId, etc.)
  forwardPackagedMessageToCallMachine(msg, iframe, newCallFrameId) {
    msg.callFrameId = newCallFrameId;
    const w = iframe ? iframe.contentWindow : window;
    // TODO: comment out
    console.log(
      '[WebMessageChannel] forwarding packaged message to call machine',
      msg
    );
    w.postMessage(msg, '*');
  }

  // Listener will be given packaged message with all internal metadata fields
  // (what, from, callFrameId, etc.)
  addListenerForPackagedMessagesFromCallMachine(listener, callFrameId) {
    // TODO: remove
    console.log(
      '[WebMessageChannel] adding listener for packaged messages from call machine...'
    );
    const wrappedListener = (evt) => {
      // TODO: remove
      console.log(
        '[WebMessageChannel] wrapped listener invoked...',
        evt,
        callFrameId
      );
      if (
        evt.data &&
        evt.data.what === 'iframe-call-message' &&
        // make callFrameId addressing backwards-compatible with
        // old versions of the library, which didn't have it
        (evt.data.callFrameId ? evt.data.callFrameId === callFrameId : true) &&
        (evt.data.from ? evt.data.from !== 'module' : true)
      ) {
        const msg = evt.data;
        listener(msg);
      }
    };
    this._wrappedListeners[listener] = wrappedListener;
    window.addEventListener('message', wrappedListener);
  }
}
