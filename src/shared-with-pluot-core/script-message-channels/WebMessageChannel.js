import ScriptMessageChannel from './ScriptMessageChannel';
import { IFRAME_MESSAGE_MARKER } from '../CommonIncludes';
import { randomStringId } from '../../utils';

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
    if (!callFrameId) {
      throw new Error(
        'undefined callFrameId. Are you trying to use a DailyCall instance previously destroyed?'
      );
    }
    let msg = { ...message };
    msg.what = IFRAME_MESSAGE_MARKER;
    msg.from = 'module';
    msg.callFrameId = callFrameId;
    if (callback) {
      let stamp = randomStringId();
      this._messageCallbacks[stamp] = callback;
      msg.callbackStamp = stamp;
    }
    const w = iframe ? iframe.contentWindow : window;
    const targetOrigin = this._callMachineTargetOrigin(iframe);
    // There may be no targetOrigin yet if we haven't set up the iframe yet
    // (In which case there's also no point posting the message)
    if (targetOrigin) {
      // console.log('[WebMessageChannel] sending message to call machine', msg);
      w.postMessage(msg, targetOrigin);
    } else {
      // console.log(
      //   "[WebMessageChannel] not sending message to call machine, as there's no targetOrigin yet",
      //   msg
      // );
    }
  }

  sendMessageToDailyJs(message, callFrameId) {
    message.what = IFRAME_MESSAGE_MARKER;
    message.callFrameId = callFrameId;
    message.from = 'embedded';
    // console.log('[WebMessageChannel] sending message to daily-js', message);
    // Note: this message is only meant for the daily-js running in the same
    // window. IframeDriverProvider is responsible for forwarding that message
    // up to the daily-js running in the parent window (the "driver" of the
    // iframe).
    window.postMessage(message, window.location.origin);
  }

  removeListener(listener) {
    const wrappedListener = this._wrappedListeners[listener];
    if (wrappedListener) {
      window.removeEventListener('message', wrappedListener);
      delete this._wrappedListeners[listener];
    }
  }

  // Expects msg to already be packaged with all internal metadata fields
  // (what, from, callFrameId, etc.)
  forwardPackagedMessageToCallMachine(msg, iframe, newCallFrameId) {
    const newMsg = { ...msg };
    newMsg.callFrameId = newCallFrameId;
    const w = iframe ? iframe.contentWindow : window;
    const targetOrigin = this._callMachineTargetOrigin(iframe);
    if (targetOrigin) {
      // console.log(
      //   '[WebMessageChannel] forwarding packaged message to call machine',
      //   msg
      // );
      w.postMessage(newMsg, targetOrigin);
    } else {
      // console.log(
      //   "[WebMessageChannel] not forwarding packaged message to call machine, as there's no targetOrigin yet",
      //   msg
      // );
    }
  }

  // Listener will be given packaged message with all internal metadata fields
  // (what, from, callFrameId, etc.)
  addListenerForPackagedMessagesFromCallMachine(listener, callFrameId) {
    const wrappedListener = (evt) => {
      // console.log(
      //   '[WebMessageChannel] received packaged call machine message',
      //   msg
      // );
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
    // For now we're still using the listener itself as the key, like in the
    // other addListener* methods. We should probably change this everywhere to
    // use a proper unique id.
    this._wrappedListeners[listener] = wrappedListener;
    window.addEventListener('message', wrappedListener);
    return listener;
  }

  removeListenerForPackagedMessagesFromCallMachine(listenerId) {
    const wrappedListener = this._wrappedListeners[listenerId];
    if (wrappedListener) {
      window.removeEventListener('message', wrappedListener);
      delete this._wrappedListeners[listenerId];
    }
  }

  // The origin of the page where the call machine is running
  _callMachineTargetOrigin(iframe) {
    if (iframe) {
      if (iframe.src) {
        return new URL(iframe.src).origin;
      }
    } else {
      return window.location.origin;
    }
  }
}
