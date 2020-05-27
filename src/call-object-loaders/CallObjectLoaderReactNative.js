import CallObjectLoader from "./CallObjectLoader";
import { callObjectBundleUrl } from "../utils";

const EMPTY_CALL_FRAME_ID = "";

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
  load(meetingUrl, _, callback) {
    setUpDailyConfig();

    // Call object script already loaded once, so no-op.
    // This happens after leave()ing and join()ing again.
    if (this._callObjectScriptLoaded) {
      window._dailyCallObjectSetup(EMPTY_CALL_FRAME_ID);
      callback(true); // true = "this load() was a no-op"
      return;
    }

    // Load the call object
    const url = callObjectBundleUrl(meetingUrl);
    fetch(url)
      .then((res) => {
        return res.text();
      })
      .then((code) => {
        eval(code);
      })
      .then(() => {
        this._callObjectScriptLoaded = true;
        callback(false); // false = "this load() wasn't a no-op"
      })
      .catch((e) => {
        console.error("Failed to load RN call object bundle", e);
      });
  }
}
