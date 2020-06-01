import CallObjectLoader from './CallObjectLoader';
import { callObjectBundleUrl } from '../utils';

const LOAD_ATTEMPTS = 3;
const LOAD_ATTEMPT_DELAY_MS = 3000;

export default class CallObjectLoaderWeb extends CallObjectLoader {
  constructor() {
    super();
    this._callObjectScriptLoaded = false;
  }

  load(meetingUrl, callFrameId, successCallback, failureCallback) {
    let attemptsRemaining = LOAD_ATTEMPTS;
    const retryOrFailureCallback = (errorMessage) => {
      --attemptsRemaining > 0
        ? setTimeout(
            () =>
              this._tryLoad(
                meetingUrl,
                callFrameId,
                successCallback,
                retryOrFailureCallback
              ),
            LOAD_ATTEMPT_DELAY_MS
          )
        : failureCallback(errorMessage);
    };
    this._tryLoad(
      meetingUrl,
      callFrameId,
      successCallback,
      retryOrFailureCallback
    );
  }

  get loaded() {
    return this._callObjectScriptLoaded;
  }

  _tryLoad(meetingUrl, callFrameId, successCallback, failureCallback) {
    if (!document) {
      console.error('need to create call object in a DOM/web context');
      return;
    }
    if (this._callObjectScriptLoaded) {
      window._dailyCallObjectSetup(callFrameId);
      successCallback(true); // true = "this load() was a no-op"
    } else {
      // add a global callFrameId so we can have both iframes and one
      // call object mode calls live at the same time
      if (!window._dailyConfig) {
        window._dailyConfig = {};
      }
      window._dailyConfig.callFrameId = callFrameId;

      const head = document.getElementsByTagName('head')[0],
        script = document.createElement('script');
      script.onload = async () => {
        this._callObjectScriptLoaded = true;
        successCallback(false); // false = "this load() wasn't a no-op"
      };
      script.onerror = async (e) => {
        failureCallback(`Failed to load call object bundle ${e.target.src}`);
      };
      script.src = callObjectBundleUrl(meetingUrl);
      head.appendChild(script);
    }
  }
}
