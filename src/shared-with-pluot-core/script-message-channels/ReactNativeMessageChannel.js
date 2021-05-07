import ScriptMessageChannel from './ScriptMessageChannel';
import { EventEmitter } from 'events';
import { randomStringId } from '../../utils';

// This file is imported by both daily-js and the call machine. Make sure we
// only instantiate each emitter once.
global.callMachineToDailyJsEmitter =
  global.callMachineToDailyJsEmitter || new EventEmitter();
global.dailyJsToCallMachineEmitter =
  global.dailyJsToCallMachineEmitter || new EventEmitter();

/**
 * A two-way message channel between daily-js and the call machine (pluot-core),
 * when running in a React Native context.
 */
export default class ReactNativeMessageChannel extends ScriptMessageChannel {
  constructor() {
    super();
    this._wrappedListeners = {}; // Mapping between listeners and wrapped listeners
    this._messageCallbacks = {};
  }

  addListenerForMessagesFromCallMachine(listener, callFrameId, thisValue) {
    this._addListener(
      listener,
      global.callMachineToDailyJsEmitter,
      thisValue,
      'received call machine message'
    );
  }

  addListenerForMessagesFromDailyJs(listener, callFrameId, thisValue) {
    this._addListener(
      listener,
      global.dailyJsToCallMachineEmitter,
      thisValue,
      'received daily-js message'
    );
  }

  sendMessageToCallMachine(message, callback) {
    this._sendMessage(
      message,
      global.dailyJsToCallMachineEmitter,
      'sending message to call machine',
      callback
    );
  }

  sendMessageToDailyJs(message) {
    this._sendMessage(
      message,
      global.callMachineToDailyJsEmitter,
      'sending message to daily-js'
    );
  }

  removeListener(listener) {
    const wrappedListener = this._wrappedListeners[listener];
    if (wrappedListener) {
      // The listener was added to one of these. Might as well try removing
      // from both (otherwise we would've needed two remove methods in this
      // class, targeting each side of the channel).
      global.callMachineToDailyJsEmitter.removeListener(
        'message',
        wrappedListener
      );
      global.dailyJsToCallMachineEmitter.removeListener(
        'message',
        wrappedListener
      );
      delete this._wrappedListeners[listener];
    }
  }

  _addListener(listener, messageEmitter, thisValue, logMessage) {
    const wrappedListener = (msg) => {
      // console.log(`[ReactNativeMessageChannel] ${logMessage}`, msg);
      if (msg.callbackStamp && this._messageCallbacks[msg.callbackStamp]) {
        // console.log('[ReactNativeMessageChannel] handling message as callback', msg);
        const callbackStamp = msg.callbackStamp; // Storing here since the callback could delete msg.callbackStamp
        this._messageCallbacks[callbackStamp].call(thisValue, msg);
        delete this._messageCallbacks[callbackStamp];
      }
      listener.call(thisValue, msg);
    };
    this._wrappedListeners[listener] = wrappedListener;
    messageEmitter.addListener('message', wrappedListener);
  }

  _sendMessage(message, messageEmitter, logMessage, callback) {
    if (callback) {
      let stamp = randomStringId();
      this._messageCallbacks[stamp] = callback;
      message.callbackStamp = stamp;
    }
    // console.log(`[ReactNativeMessageChannel] ${logMessage}`, message);
    messageEmitter.emit('message', message);
  }
}
