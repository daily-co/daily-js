import CallObjectLoader from "./CallObjectLoader";
import { callObjectBundleUrl } from "../utils";

function setUpDailyConfig() {
  // The call object bundle expects a global _dailyConfig to already exist,
  // to read a callFrameId from. In React Native, there's no so such thing as
  // other ongoing calls in iframes, so just provide an empty string.
  if (!window._dailyConfig) {
    window._dailyConfig = {};
  }
  window._dailyConfig.callFrameId = "";
}

export default class CallObjectLoaderReactNative extends CallObjectLoader {
  load(meetingUrl, _, callback) {
    setUpDailyConfig();
    const url = callObjectBundleUrl(meetingUrl);
    fetch(url)
      .then((res) => {
        return res.text();
      })
      .then((code) => {
        eval(code);
      })
      .then(() => {
        callback(false); // false = "wasn't no-op"
      })
      .catch((e) => {
        console.error("Failed to load RN call object bundle", e);
      });
  }
}
