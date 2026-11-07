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
    this._wrappedListeners = new Map(); // Key listeners by function identity
    this._messageCallbacks = {};
  }

  addListenerForMessagesFromCallMachine(listener, callClientId, thisValue) {
    const wrappedListener = (evt) => {
      if (
        evt.data &&
        evt.data.what === 'iframe-call-message' &&
        // make callClientId addressing backwards-compatible with
        // old versions of the library, which didn't have it
        (evt.data.callClientId
          ? evt.data.callClientId === callClientId
          : true) &&
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
    this._wrappedListeners.set(listener, wrappedListener);
    window.addEventListener('message', wrappedListener);
  }

  addListenerForMessagesFromDailyJs(listener, callClientId, thisValue) {
    const wrappedListener = (evt) => {
      // This listens to ALL messages so we must discern which messages
      // are for us by making sure that the message matches the format we
      // expect and is addressed to our same call client (callClientId matches)
      // This listener, specifically, only wants to deal with listening
      // messages coming from a matching daily-js call client instance. In
      // embedded iFrame mode it, we only want messages from the inner frame.
      // (The outer frame's messages are handled by IframeDriverMessageChannel)
      // If the outter frame is older (daily-js < 0.67), it will store the
      // client id as callFrameId. So it's safe to disregard any message with
      // that key
      // NOTE: It's tempting to change the default of the callClientId check
      //       to false. Sure seems like it should be, but I'm too timid, so
      //       for now just throw out any message with callFrameId.
      if (
        !(
          evt.data &&
          evt.data.what === IFRAME_MESSAGE_MARKER &&
          evt.data.action &&
          (!evt.data.from || evt.data.from === 'module') &&
          (evt.data.callClientId && callClientId
            ? evt.data.callClientId === callClientId
            : true) &&
          !evt?.data?.callFrameId
        )
      ) {
        return;
      }
      const msg = evt.data;
      // console.log('[WebMessageChannel] received daily-js message', msg);
      listener.call(thisValue, msg);
    };
    this._wrappedListeners.set(listener, wrappedListener);
    window.addEventListener('message', wrappedListener);
  }

  sendMessageToCallMachine(message, callback, callClientId, iframe) {
    if (!callClientId) {
      throw new Error(
        'undefined callClientId. Are you trying to use a DailyCall instance previously destroyed?'
      );
    }
    let msg = { ...message };
    msg.what = IFRAME_MESSAGE_MARKER;
    msg.from = 'module';
    msg.callClientId = callClientId;
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

  sendMessageToDailyJs(message, callClientId) {
    message.what = IFRAME_MESSAGE_MARKER;
    message.callClientId = callClientId;
    message.from = 'embedded';
    // console.log('[WebMessageChannel] sending message to daily-js', message);
    // Note: this message is only meant for the daily-js running in the same
    // window. IframeDriverProvider is responsible for forwarding that message
    // up to the daily-js running in the parent window (the "driver" of the
    // iframe).
    window.postMessage(message, this._targetOriginFromWindowLocation());
  }

  removeListener(listener) {
    const wrappedListener = this._wrappedListeners.get(listener);
    if (wrappedListener) {
      window.removeEventListener('message', wrappedListener);
      this._wrappedListeners.delete(listener);
    }
  }

  // Expects msg to already be packaged with all internal metadata fields
  // (what, from, callClientId, etc.)
  forwardPackagedMessageToCallMachine(msg, iframe, newCallClientId) {
    const newMsg = { ...msg };
    newMsg.callClientId = newCallClientId;
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
  // (what, from, callClientId, etc.)
  addListenerForPackagedMessagesFromCallMachine(listener, callClientId) {
    const wrappedListener = (evt) => {
      // console.log(
      //   '[WebMessageChannel] received packaged call machine message',
      //   msg
      // );
      if (
        evt.data &&
        evt.data.what === 'iframe-call-message' &&
        // make callClientId addressing backwards-compatible with
        // old versions of the library, which didn't have it
        (evt.data.callClientId
          ? evt.data.callClientId === callClientId
          : true) &&
        (evt.data.from ? evt.data.from !== 'module' : true)
      ) {
        const msg = evt.data;
        listener(msg);
      }
    };
    // Return the original listener as the handle used for removal.
    this._wrappedListeners.set(listener, wrappedListener);
    window.addEventListener('message', wrappedListener);
    return listener;
  }

  removeListenerForPackagedMessagesFromCallMachine(listenerId) {
    const wrappedListener = this._wrappedListeners.get(listenerId);
    if (wrappedListener) {
      window.removeEventListener('message', wrappedListener);
      this._wrappedListeners.delete(listenerId);
    }
  }

  // The origin of the page where the call machine is running
  _callMachineTargetOrigin(iframe) {
    if (iframe) {
      if (iframe.src) {
        return new URL(iframe.src).origin;
      }
    } else {
      return this._targetOriginFromWindowLocation();
    }
  }

  // Converts this window's current location into something that can be used as
  // a target origin for window.postMessage() calls.
  _targetOriginFromWindowLocation() {
    // According to MDN: 'posting a message to a page at a `file:` URL currently requires that the targetOrigin argument be "*"'
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
    return window.location.protocol === 'file:' ? '*' : window.location.origin;
  }
}
