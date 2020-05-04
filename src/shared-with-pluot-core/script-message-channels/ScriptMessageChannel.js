function notImplementedError() {
  throw new Error("Method must be implemented in subclass");
}

/**
 * A two-way message channel between daily-js and the call machine (pluot-core).
 */
export default class ScriptMessageChannel {
  /**
   * Adds a listener for messages from the call machine (pluot-core).
   * For use by daily-js.
   */
  addListenerForCallMachineMessages(listener, callFrameId, thisToBind) {
    notImplementedError();
  }

  /**
   * Adds a listener for messages from daily-js.
   * For use by the call machine (pluot-core).
   */
  addListenerForDailyJsMessages(listener, callFrameId) {
    notImplementedError();
  }

  /**
   * Send a message to the call machine (pluot-core).
   * For use by daily-js.
   */
  sendMessageToCallMachine(message, callback, iframe, callFrameId) {
    notImplementedError();
  }

  /**
   * Send a message to daily-js.
   * For use by the call machine (pluot-core).
   */
  sendMessageToDailyJs(message) {
    notImplementedError();
  }

  /**
   * Remove an added listener.
   */
  removeListener(listener) {
    notImplementedError();
  }
}
