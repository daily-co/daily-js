import { isReactNative } from './shared-with-pluot-core/Environment';
import { callObjectBundleUrl, randomStringId } from './utils';

function prepareDailyConfig(callFrameId, avoidEval) {
  // Add a global callFrameId so we can have both iframes and one
  // call object mode calls live at the same time
  if (!window._dailyConfig) {
    window._dailyConfig = {};
  }
  window._dailyConfig.callFrameId = callFrameId;
  window._dailyConfig.avoidEval = avoidEval;
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
   * @param callFrameId A string identifying this "call frame", to distinguish it
   *  from other iframe-based calls for message channel purposes.
   * @param avoidEval Whether to use the new eval-less loading mechanism on web
   *  (LoadAttempt_Web) instead of the legacy loading mechanism
   *  (LoadAttempt_ReactNative).
   * @param successCallback Callback function that takes a wasNoOp argument
   *  (true if call object script was ever loaded once before).
   * @param failureCallback Callback function that takes an error message and a
   *   boolean indicating whether an automatic retry is slated to occur.
   */
  load(callFrameId, avoidEval, successCallback, failureCallback) {
    if (this.loaded) {
      window._dailyCallObjectSetup(callFrameId);
      successCallback(true); // true = "this load() was a no-op"
      return;
    }

    prepareDailyConfig(callFrameId, avoidEval);

    // Cancel current load, if any
    this._currentLoad && this._currentLoad.cancel();

    // Start a new load
    this._currentLoad = new LoadOperation(() => {
      successCallback(false); // false = "this load() wasn't a no-op"
    }, failureCallback);
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

/**
 * Represents a call machine bundle load.
 *
 * Since a load may fail, it may need to retry a few times. It delegates each
 * attempt to the LoadAttempt class.
 */
class LoadOperation {
  // Here failureCallback takes the same parameters as CallObjectLoader.load,
  // and successCallback takes no parameters.
  constructor(successCallback, failureCallback) {
    this._attemptsRemaining = LOAD_ATTEMPTS;
    this._currentAttempt = null;

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
          this._successCallback,
          retryOrFailureCallback
        );
        this._currentAttempt.start();
      }, LOAD_ATTEMPT_DELAY);
    };

    this._currentAttempt = new LoadAttempt(
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

/**
 * Represents a single call machine bundle load attempt.
 *
 * The LoadOperation does the heavy lifting in terms of coordinating different
 * LoadAttempts (i.e. kicking off retries and handling interruptions by, say, a
 * user calling leave()). It will ask each LoadAttempt to start() and, if
 * necessary, cancel().
 *
 * The LoadAttempt itself only needs to concern itself with obeying those
 * requests, invoking the success or failure callbacks at the end of an attempt,
 * and setting its cancelled and succeeded flags as appropriate.
 *
 * Since we support running both on Web and React Native and there are slightly
 * different constraints on each, there are two different implementations of
 * LoadAttempt:
 * - On Web, we use an HTMLScriptElement to load the bundle in order
 * to allow our users to set a CSP (Content Security Policy) without
 * 'unsafe-eval'. The alternative would be using fetch() + Function()/eval().
 * - On React Native, we use fetch() + Function(). There is no HTMLScriptElement
 * in React Native and also no CSP consideration to contend with.
 */
class LoadAttempt {
  constructor(successCallback, failureCallback) {
    this._loadAttemptImpl =
      isReactNative() || !_dailyConfig.avoidEval
        ? new LoadAttempt_ReactNative(successCallback, failureCallback)
        : new LoadAttempt_Web(successCallback, failureCallback);
  }

  async start() {
    return this._loadAttemptImpl.start();
  }

  cancel() {
    this._loadAttemptImpl.cancel();
  }

  get cancelled() {
    return this._loadAttemptImpl.cancelled;
  }

  get succeeded() {
    return this._loadAttemptImpl.succeeded;
  }
}

/**
 * Represents a single call machine bundle load attempt in React Native.
 *
 * NOTE: this is also the legacy web code path, when avoidEval is not set.
 */
class LoadAttempt_ReactNative {
  // Here successCallback takes no parameters, and failureCallback takes a
  // single error message parameter.
  constructor(successCallback, failureCallback) {
    this.cancelled = false;
    this.succeeded = false;

    this._networkTimedOut = false;
    this._networkTimeout = null;

    this._iosCache =
      typeof iOSCallObjectBundleCache !== 'undefined' &&
      iOSCallObjectBundleCache;
    this._refetchHeaders = null;

    this._successCallback = successCallback;
    this._failureCallback = failureCallback;
  }

  async start() {
    // console.log("[LoadAttempt_ReactNative] starting...");
    const url = callObjectBundleUrl();
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
    // console.log("[LoadAttempt_ReactNative] trying to load from iOS cache...");

    // Bail if we're not running in iOS
    if (!this._iosCache) {
      // console.log("[LoadAttempt_ReactNative] not iOS, so not checking iOS cache");
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
        // console.log("[LoadAttempt_ReactNative] iOS cache miss");
        return false;
      }

      // If cache expired, store refetch headers to use later and report
      // failure (network load needed)
      if (!cacheResponse.code) {
        // console.log(
        //   "[LoadAttempt_ReactNative] iOS cache expired, setting refetch headers",
        //   cacheResponse.refetchHeaders
        // );
        this._refetchHeaders = cacheResponse.refetchHeaders;
        return false;
      }

      // Cache is fresh, so run code and success callback, and report work
      // complete (no network load needed)
      // console.log("[LoadAttempt_ReactNative] iOS cache hit");
      Function('"use strict";' + cacheResponse.code)();
      this.succeeded = true;
      this._successCallback();
      return true;
    } catch (e) {
      // Report failure
      // console.log("[LoadAttempt_ReactNative] failure running bundle from iOS cache", e);
      return false;
    }
  }

  /**
   * Try to load the call object bundle from the network.
   * @param {string} url The url of the call object bundle to load.
   */
  async _loadFromNetwork(url) {
    // console.log("[LoadAttempt_ReactNative] trying to load from network...");
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
      // console.log("[LoadAttempt_ReactNative] succeeded...");
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
        // console.log("[LoadAttempt_ReactNative] cancelled or timed out");
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

/**
 * Represents a single call machine bundle load attempt on Web.
 *
 * While this attempt is active - that is, it hasn't been cancelled or hasn't
 * timed out - it signs itself up to be on a global "call machine load
 * waitlist", which represents the set of load attempts that want the call
 * machine to finish loading.
 *
 * Because...
 * a) ..."finishing loading" is something that happens on the call machine
 *    bundle side (i.e. not in this code) once it's been downloaded and is
 *    executing, and...
 * b) ...we actually *can't* stop the call machine bundle from running after an
 *    attempt has been cancelled or timed out, if the bundle finishes
 *    downloading (HTMLScriptElement doesn't have a cancel() method)...
 * ...we need a way of telling the call machine bundle "hey someone's still
 * interested in you loading".
 *
 * Note that there really shouldn't be more than one active load attempt at a
 * time. But this load attempt doesn't know that! Hence the waitlist being a
 * Set() and each attempt being responsible only for adding/removing itself from
 * the waitlist. This approach - as opposed to a global boolean or counter -
 * felt like the most bulletproof (i.e. future- and race-condition-proof) way
 * of implementing this synchronization.
 */
class LoadAttempt_Web {
  constructor(successCallback, failureCallback) {
    this.cancelled = false;
    this.succeeded = false;

    this._successCallback = successCallback;
    this._failureCallback = failureCallback;

    this._attemptId = randomStringId();
    this._networkTimeout = null;
    this._scriptElement = null;
  }

  async start() {
    // Initialize global state tracking active load attempts
    if (!window._dailyCallMachineLoadWaitlist) {
      window._dailyCallMachineLoadWaitlist = new Set();
    }

    // Get call machine bundle URL
    const url = callObjectBundleUrl();

    // Sanity check that we're running in a DOM/web context
    if (typeof document !== 'object') {
      this._failureCallback(
        `Call object bundle must be loaded in a DOM/web context`
      );
      return;
    }

    this._startLoading(url);
  }

  cancel() {
    // console.log('[LoadAttempt_Web] cancelled');
    this._stopLoading();
    this.cancelled = true;
  }

  _startLoading(url) {
    // console.log('[LoadAttempt_Web] trying to load...');
    this._signUpForCallMachineLoadWaitlist();

    // Start a timeout, after which we'll consider this attempt a failure
    this._networkTimeout = setTimeout(() => {
      // console.log('[LoadAttempt_Web] timed out');
      this._stopLoading();
      this._failureCallback(
        `Timed out (>${LOAD_ATTEMPT_NETWORK_TIMEOUT} ms) when loading call object bundle ${url}`
      );
    }, LOAD_ATTEMPT_NETWORK_TIMEOUT);

    // Create a script tag to download the call machine bundle
    const head = document.getElementsByTagName('head')[0],
      script = document.createElement('script');
    this._scriptElement = script;

    // On load, consider this attempt a success
    script.onload = async () => {
      // console.log('[LoadAttempt_Web] succeeded');
      this._stopLoading();
      this.succeeded = true;
      this._successCallback();
    };

    // On error, consider this attempt a failure
    script.onerror = async (e) => {
      // console.log('[LoadAttempt_Web] failed');
      this._stopLoading();
      this._failureCallback(
        `Failed to load call object bundle ${e.target.src}`
      );
    };

    // Start the download
    script.src = url;
    head.appendChild(script);
  }

  _stopLoading() {
    this._withdrawFromCallMachineLoadWaitlist();
    clearTimeout(this._networkTimeout);
    if (this._scriptElement) {
      this._scriptElement.onload = null;
      this._scriptElement.onerror = null;
    }
  }

  _signUpForCallMachineLoadWaitlist() {
    window._dailyCallMachineLoadWaitlist.add(this._attemptId);
  }

  _withdrawFromCallMachineLoadWaitlist() {
    window._dailyCallMachineLoadWaitlist.delete(this._attemptId);
  }
}
