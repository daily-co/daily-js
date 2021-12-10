import { callObjectBundleUrl } from './utils';

function prepareDailyConfig(callFrameId) {
  // Add a global callFrameId so we can have both iframes and one
  // call object mode calls live at the same time
  if (!window._dailyConfig) {
    window._dailyConfig = {};
  }
  window._dailyConfig.callFrameId = callFrameId;
}

export default class CallObjectLoader {
  constructor() {
    this._currentLoad = null;
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
   * @param failureCallback Callback function that takes an error message and a
   *   boolean indicating whether an automatic retry is slated to occur.
   */
  load(meetingOrBaseUrl, callFrameId, successCallback, failureCallback) {
    if (this.loaded) {
      window._dailyCallObjectSetup(callFrameId);
      successCallback(true); // true = "this load() was a no-op"
      return;
    }

    prepareDailyConfig(callFrameId);

    // Cancel current load, if any
    this._currentLoad && this._currentLoad.cancel();

    // Start a new load
    this._currentLoad = new LoadOperation(
      meetingOrBaseUrl,
      callFrameId,
      () => {
        successCallback(false); // false = "this load() wasn't a no-op"
      },
      failureCallback
    );
    this._currentLoad.start();
  }

  /**
   * Cancel loading the call object bundle. No callbacks will be invoked.
   */
  cancel() {
    this._currentLoad && this._currentLoad.cancel();
  }

  /**
   * Returns a boolean indicating whether the call object bundle has been
   * loaded and executed.
   */
  get loaded() {
    return this._currentLoad && this._currentLoad.succeeded;
  }
}

const LOAD_ATTEMPTS = 3;
const LOAD_ATTEMPT_DELAY = 3 * 1000;

class LoadOperation {
  // Here failureCallback takes the same parameters as CallObjectLoader.load,
  // and successCallback takes no parameters.
  constructor(meetingOrBaseUrl, callFrameId, successCallback, failureCallback) {
    this._attemptsRemaining = LOAD_ATTEMPTS;
    this._currentAttempt = null;

    this._meetingOrBaseUrl = meetingOrBaseUrl;
    this._callFrameId = callFrameId;
    this._successCallback = successCallback;
    this._failureCallback = failureCallback;
  }

  start() {
    // Bail if this load has already started
    if (this._currentAttempt) {
      return;
    }

    // console.log("[LoadOperation] starting...");

    const retryOrFailureCallback = (errorMessage) => {
      if (this._currentAttempt.cancelled) {
        // console.log("[LoadOperation] cancelled");
        return;
      }

      this._attemptsRemaining--;
      this._failureCallback(errorMessage, this._attemptsRemaining > 0); // true = "will retry"
      if (this._attemptsRemaining <= 0) {
        // Should never be <0, but just being extra careful here
        // console.log("[LoadOperation] ran out of attempts");
        return;
      }

      setTimeout(() => {
        if (this._currentAttempt.cancelled) {
          // console.log("[LoadOperation] cancelled");
          return;
        }
        this._currentAttempt = new LoadAttempt(
          this._meetingOrBaseUrl,
          this._callFrameId,
          this._successCallback,
          retryOrFailureCallback
        );
        this._currentAttempt.start();
      }, LOAD_ATTEMPT_DELAY);
    };

    this._currentAttempt = new LoadAttempt(
      this._meetingOrBaseUrl,
      this._callFrameId,
      this._successCallback,
      retryOrFailureCallback
    );
    this._currentAttempt.start();
  }

  cancel() {
    this._currentAttempt && this._currentAttempt.cancel();
  }

  get cancelled() {
    return this._currentAttempt && this._currentAttempt.cancelled;
  }

  get succeeded() {
    return this._currentAttempt && this._currentAttempt.succeeded;
  }
}

class LoadAttemptAbortedError extends Error {}

const LOAD_ATTEMPT_NETWORK_TIMEOUT = 20 * 1000;

class LoadAttempt {
  // Here successCallback takes no parameters, and failureCallback takes a
  // single error message parameter.
  constructor(meetingOrBaseUrl, callFrameId, successCallback, failureCallback) {
    this.cancelled = false;
    this.succeeded = false;

    this._networkTimedOut = false;
    this._networkTimeout = null;

    this._iosCache =
      typeof iOSCallObjectBundleCache !== 'undefined' &&
      iOSCallObjectBundleCache;
    this._refetchHeaders = null;

    this._meetingOrBaseUrl = meetingOrBaseUrl;
    this._callFrameId = callFrameId;
    this._successCallback = successCallback;
    this._failureCallback = failureCallback;
  }

  async start() {
    // console.log("[LoadAttempt] starting...");
    let url;
    try {
      url = callObjectBundleUrl(this._meetingOrBaseUrl);
    } catch (e) {
      this._failureCallback(
        `Failed to get call object bundle URL ${url}: ${e}`
      );
      return;
    }
    const loadedFromIOSCache = await this._tryLoadFromIOSCache(url);
    !loadedFromIOSCache && this._loadFromNetwork(url);
  }

  cancel() {
    clearTimeout(this._networkTimeout);
    this.cancelled = true;
  }

  /**
   * Try to load the call object bundle from the iOS cache.
   * This is a React Native-specific workaround for the fact that the iOS HTTP
   * cache won't cache the call object bundle due to size.
   *
   * @param {string} url The url of the call object bundle to try to load.
   * @returns A Promise that resolves to false if the load failed or true
   * otherwise (if it succeeded or was cancelled), indicating whether a network
   * load attempt is needed.
   */
  async _tryLoadFromIOSCache(url) {
    // console.log("[LoadAttempt] trying to load from iOS cache...");

    // Bail if we're not running in iOS
    if (!this._iosCache) {
      // console.log("[LoadAttempt] not iOS, so not checking iOS cache");
      return false;
    }

    try {
      const cacheResponse = await this._iosCache.get(url);

      // If load has been cancelled, report work complete (no network load
      // needed)
      if (this.cancelled) {
        return true;
      }

      // If cache miss, report failure (network load needed)
      if (!cacheResponse) {
        // console.log("[LoadAttempt] iOS cache miss");
        return false;
      }

      // If cache expired, store refetch headers to use later and report
      // failure (network load needed)
      if (!cacheResponse.code) {
        // console.log(
        //   "[LoadAttempt] iOS cache expired, setting refetch headers",
        //   cacheResponse.refetchHeaders
        // );
        this._refetchHeaders = cacheResponse.refetchHeaders;
        return false;
      }

      // Cache is fresh, so run code and success callback, and report work
      // complete (no network load needed)
      // console.log("[LoadAttempt] iOS cache hit");
      Function('"use strict";' + cacheResponse.code)();
      this.succeeded = true;
      this._successCallback();
      return true;
    } catch (e) {
      // Report failure
      // console.log("[LoadAttempt] failure running bundle from iOS cache", e);
      return false;
    }
  }

  /**
   * Try to load the call object bundle from the network.
   * @param {string} url The url of the call object bundle to load.
   */
  async _loadFromNetwork(url) {
    // console.log("[LoadAttempt] trying to load from network...");
    this._networkTimeout = setTimeout(() => {
      this._networkTimedOut = true;
      this._failureCallback(
        `Timed out (>${LOAD_ATTEMPT_NETWORK_TIMEOUT} ms) when loading call object bundle ${url}`
      );
    }, LOAD_ATTEMPT_NETWORK_TIMEOUT);

    try {
      const fetchOptions = this._refetchHeaders
        ? { headers: this._refetchHeaders }
        : {};
      const response = await fetch(url, fetchOptions);
      clearTimeout(this._networkTimeout);

      // Check that load wasn't cancelled or timed out during fetch
      if (this.cancelled || this._networkTimedOut) {
        throw new LoadAttemptAbortedError();
      }

      const code = await this._getBundleCodeFromResponse(url, response);

      // Check again that load wasn't cancelled during reading response
      if (this.cancelled) {
        throw new LoadAttemptAbortedError();
      }

      // Execute bundle code
      Function('"use strict";' + code)();

      // Since code ran successfully (no errors thrown), cache it and call
      // success callback
      // console.log("[LoadAttempt] succeeded...");
      this._iosCache && this._iosCache.set(url, code, response.headers);
      this.succeeded = true;
      this._successCallback();
    } catch (e) {
      clearTimeout(this._networkTimeout);

      // We need to check all these conditions since long outstanding
      // requests can fail *after* cancellation or timeout (i.e. checking for
      // LoadAttemptAbortedError is not enough).
      if (
        e instanceof LoadAttemptAbortedError ||
        this.cancelled ||
        this._networkTimedOut
      ) {
        // console.log("[LoadAttempt] cancelled or timed out");
        return;
      }

      this._failureCallback(`Failed to load call object bundle ${url}: ${e}`);
    }
  }

  async _getBundleCodeFromResponse(url, response) {
    // Normal success case
    if (response.ok) {
      return await response.text();
    }

    // React Native iOS-specific case: 304 Not-Modified response
    // (Since we're doing manual cache management for iOS, the fetch mechanism
    //  doesn't opaquely handle 304s for us)
    if (this._iosCache && response.status === 304) {
      const cacheResponse = await this._iosCache.renew(url, response.headers);
      return cacheResponse.code;
    }

    throw new Error(`Received ${response.status} response`);
  }
}
