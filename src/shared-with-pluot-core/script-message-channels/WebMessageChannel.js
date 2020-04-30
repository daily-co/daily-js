import ScriptMessageChannel from './ScriptMessageChannel';

/**
 * A two-way message channel between daily-js and the call machine (pluot-core),
 * when running in a web context (in a browser or Electron).
 */
export default class WebMessageChannel extends ScriptMessageChannel {
  constructor() {
    super();
    this.wrappedListeners = {}; // Mapping between listeners and wrapped listeners
  }

  addListenerForCallMachineMessages(callFrameId, listener, thisToBind) {
    const wrappedListener = (evt) => {
      if (
        evt.data &&
        evt.data.what === 'iframe-call-message' &&
        // make callFrameId addressing backwards-compatible with
        // old versions of the library, which didn't have it
        (evt.data.callFrameId ? evt.data.callFrameId === callFrameId : true) &&
        (evt.data.from ? evt.data.from !== 'module' : true)
      ) {
        // console.log('handling module message', evt.data);
        delete evt.data.from;
        listener.bind(thisToBind)(evt.data);
      }
    };
    this.wrappedListeners[listener] = wrappedListener;
    window.addEventListener('message', wrappedListener);
  }

  addListenerForDailyJsMessages(callFrameId, listener) {}

  removeListener(listener) {
    const wrappedListener = this.wrappedListeners[listener];
    if (wrappedListener) {
      window.removeEventListener('message', wrappedListener);
      delete this.wrappedListeners[listener];
    }
  }

  sendMessageToCallMachine(message, callback, iframe) {}

  sendMessageToCallMachine(message) {}
}
