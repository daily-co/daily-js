import CallObjectLoader from "./CallObjectLoader";
import { callObjectBundleUrl } from "../utils";

const EMPTY_CALL_FRAME_ID = "";
const LOAD_ATTEMPTS = 3;
const LOAD_ATTEMPT_DELAY_MS = 3000;

function setUpDailyConfig() {
  // The call object bundle expects a global _dailyConfig to already exist,
  // to read a callFrameId from. In React Native, there's no so such thing as
  // other ongoing calls in iframes, so just provide an empty string.
  if (!window._dailyConfig) {
    window._dailyConfig = {};
  }
  window._dailyConfig.callFrameId = EMPTY_CALL_FRAME_ID;
}

export default class CallObjectLoaderReactNative extends CallObjectLoader {
  constructor() {
    super();
    this._callObjectScriptLoaded = false;
  }

  load(meetingUrl, _, successCallback, failureCallback) {
    let attemptsRemaining = LOAD_ATTEMPTS;
    const retryOrFailureCallback = (errorMessage) => {
      --attemptsRemaining > 0
        ? setTimeout(
            () =>
              this._tryLoad(
                meetingUrl,
                successCallback,
                retryOrFailureCallback
              ),
            LOAD_ATTEMPT_DELAY_MS
          )
        : failureCallback(errorMessage);
    };
    this._tryLoad(meetingUrl, successCallback, retryOrFailureCallback);
  }

  get loaded() {
    return this._callObjectScriptLoaded;
  }

  _tryLoad(meetingUrl, successCallback, failureCallback) {
    setUpDailyConfig();

    // Call object script already loaded once, so no-op.
    // This happens after leave()ing and join()ing again.
    if (this._callObjectScriptLoaded) {
      window._dailyCallObjectSetup(EMPTY_CALL_FRAME_ID);
      successCallback(true); // true = "this load() was a no-op"
      return;
    }

    // Load the call object
    const url = callObjectBundleUrl(meetingUrl);
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
