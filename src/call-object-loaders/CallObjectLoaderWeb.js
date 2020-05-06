import CallObjectLoader from "./CallObjectLoader";
import { callObjectBundleUrl } from "../utils";

export default class CallObjectLoaderWeb extends CallObjectLoader {
  constructor() {
    super();
    this._callObjectScriptLoaded = false;
  }

  load(meetingUrl, callback) {
    if (!document) {
      console.error("need to create call object in a DOM/web context");
      return;
    }
    if (this._callObjectScriptLoaded) {
      window._dailyCallObjectSetup();
      callback(true); // true = "was no-op"
    } else {
      const head = document.getElementsByTagName("head")[0],
        script = document.createElement("script");
      script.onload = async () => {
        this._callObjectScriptLoaded = true;
        callback(false); // false = "wasn't no-op"
      };
      script.src = callObjectBundleUrl(meetingUrl);
      head.appendChild(script);
    }
  }
}
