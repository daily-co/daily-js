import { callObjectBundleUrl } from "./utils";

const LOAD_ATTEMPTS = 3;
const LOAD_ATTEMPT_DELAY_MS = 3000;

export default class CallObjectLoader {
  constructor() {
    this._callObjectScriptLoaded = false;
  }

  /**
   * Loads the call object bundle (if needed), then invokes the callback
   * function, which takes one boolean argument whose value is true if the
   * load was a no-op.
   *
   * No-op loads can happen when leaving a meeting and then later joining one.
   * Since the call object bundle sets up global state in the same scope as the
   * app code consuming it, it only needs to be loaded and executed once ever.
   *
   * @param meetingOrBaseUrl Meeting URL (like https://somecompany.daily.co/hello)
   *  or base URL (like https://somecompany.daily.co), used to determine where
   *  to load the bundle from.
   * @param callFrameId A string identifying this "call frame", to distinguish it
   *  from other iframe-based calls for message channel purposes.
   * @param successCallback Callback function that takes a wasNoOp argument
   *  (true if call object script was ever loaded once before).
   * @param failureCallback Callback function that takes an error message.
   */
  load(meetingOrBaseUrl, callFrameId, successCallback, failureCallback) {
    let attemptsRemaining = LOAD_ATTEMPTS;
    const retryOrFailureCallback = (errorMessage) => {
      --attemptsRemaining > 0
        ? setTimeout(
            () =>
              this._tryLoad(
                meetingOrBaseUrl,
                callFrameId,
                successCallback,
                retryOrFailureCallback
              ),
            LOAD_ATTEMPT_DELAY_MS
          )
        : failureCallback(errorMessage);
    };
    this._tryLoad(
      meetingOrBaseUrl,
      callFrameId,
      successCallback,
      retryOrFailureCallback
    );
  }

  /**
   * Returns a boolean indicating whether the call object has been loaded and
   * executed.
   */
  get loaded() {
    return this._callObjectScriptLoaded;
  }

  _tryLoad(meetingOrBaseUrl, callFrameId, successCallback, failureCallback) {
    // Call object script already loaded once, so no-op.
    // This happens after leave()ing and join()ing again.
    if (this._callObjectScriptLoaded) {
      window._dailyCallObjectSetup(callFrameId);
      successCallback(true); // true = "this load() was a no-op"
      return;
    }

    // Add a global callFrameId so we can have both iframes and one
    // call object mode calls live at the same time
    if (!window._dailyConfig) {
      window._dailyConfig = {};
    }
    window._dailyConfig.callFrameId = callFrameId;

    // Load the call object
    const url = callObjectBundleUrl(meetingOrBaseUrl);
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Received ${res.status} response`);
        }
        return res.text();
      })
      .then((code) => {
        eval(code);
      })
      .then(() => {
        this._callObjectScriptLoaded = true;
        successCallback(false); // false = "this load() wasn't a no-op"
      })
      .catch((e) => {
        failureCallback(`Failed to load call object bundle ${url}: ${e}`);
      });
  }
}
