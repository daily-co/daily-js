import CallObjectLoader from "./CallObjectLoader";

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
      // Use the CDN to get call-machine-object (but use whatever's "local" for dev+staging)
      if (process.env.NODE_ENV === "production") {
        script.src = `https://c.daily.co/static/call-machine-object-bundle.js`;
      } else {
        let url = new URL(meetingUrl);
        script.src = `${url.origin}/static/call-machine-object-bundle.js`;
      }
      head.appendChild(script);
    }
  }
}
