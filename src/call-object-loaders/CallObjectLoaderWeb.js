import CallObjectLoader from "./CallObjectLoader";
import { callObjectBundleUrl } from "../utils";

export default class CallObjectLoaderWeb extends CallObjectLoader {
  constructor() {
    super();
    this._callObjectScriptLoaded = false;
  }

  load(meetingUrl, callFrameId, callback) {
    if (!document) {
      console.error("need to create call object in a DOM/web context");
      return;
    }
    if (this._callObjectScriptLoaded) {
      window._dailyCallObjectSetup(callFrameId);
      callback(true); // true = "this load() was a no-op"
    } else {
      // add a global callFrameId so we can have both iframes and one
      // call object mode calls live at the same time
      if (!window._dailyConfig) {
        window._dailyConfig = {};
      }
      window._dailyConfig.callFrameId = callFrameId;

      const head = document.getElementsByTagName("head")[0],
        script = document.createElement("script");
      script.onload = async () => {
        this._callObjectScriptLoaded = true;
        callback(false); // false = "this load() wasn't a no-op"
      };
      script.src = callObjectBundleUrl(meetingUrl);
      head.appendChild(script);
    }
  }
}
