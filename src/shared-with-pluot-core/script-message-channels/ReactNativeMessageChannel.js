import ScriptMessageChannel from './ScriptMessageChannel';
import { EventEmitter } from 'events';

global.callMachineToDailyJsEmitter = new EventEmitter();
global.dailyJsToCallMachineEmitter = new EventEmitter();

/**
 * A two-way message channel between daily-js and the call machine (pluot-core),
 * when running in a React Native context.
 */
export default class ReactNativeMessageChannel extends ScriptMessageChannel {
  constructor() {
    super();
    this._wrappedListeners = {}; // Mapping between listeners and wrapped listeners
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

  sendMessageToCallMachine(message, callback, iframe, callFrameId) {
    this._sendMessage(
      message,
      global.dailyJsToCallMachineEmitter,
      'sending message to call machine'
    );
  }

  sendMessageToDailyJs(message, isCallObject, callFrameId) {
    this._sendMessage(
      message,
      global.callMachineToDailyJsEmitter,
      'sending message to daily-js'
    );
  }

  removeListener(listener) {
    const wrappedListener = this._wrappedListeners[listener];
    if (wrappedListener) {
      window.removeEventListener('message', wrappedListener);
      delete this._wrappedListeners[listener];
    }
  }

  _addListener(listener, messageEmitter, thisValue, logMessage) {
    const wrappedListener = (evt) => {
      const msg = evt.data;
      // console.log(`[ReactNativeMessageChannel] ${logMessage}`, msg);
      listener.call(thisValue, msg);
      // TODO: handle callbacks and test
    };
    this._wrappedListeners[listener] = wrappedListener;
    messageEmitter.addListener('message', wrappedListener);
  }

  _sendMessage(message, messageEmitter, logMessage) {
    // TODO: handle adding callbackStamp
    // console.log(`[ReactNativeMessageChannel] ${logMessage}`, message);
    messageEmitter.emit('message', message);
  }
}
