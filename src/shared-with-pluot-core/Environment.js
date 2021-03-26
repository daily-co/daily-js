import Bowser from 'bowser';

// This method should be used instead of window.navigator.userAgent, which
// is not defined in React Native and results in an error.
// (Actually, if it *is* defined in React Native, it's not meant for us, but
// for our customer's code; that's why we don't just simply override it globally).
export function getUserAgent() {
  if (
    !isReactNative() &&
    typeof window !== 'undefined' &&
    window.navigator &&
    window.navigator.userAgent
  ) {
    return window.navigator.userAgent;
  }
  return '';
}

export function isReactNative() {
  return (
    typeof navigator !== 'undefined' &&
    navigator.product &&
    navigator.product === 'ReactNative'
  );
}

export function isIOS() {
  const userAgent = getUserAgent();
  return !!userAgent.match(/iPad|iPhone|iPod/i);
}

// Only valid if cam/mic are accessible from browser
export function isUserMediaAccessible() {
  return (
    navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  );
}

// Returns whether we should allow screen sharing from this browser.
//
// Note: technically we *could* try to support screen sharing from any browser where
// isDisplayMediaAccessible() is true (PeerToPeer.js is mostly set up to do so).
// However, limiting screen sharing to only those that support the Unified Plan SDP
// format lets us simplify code paths on the receiving end of screen shares: in order
// to check whether to always expect a single inbound video track, we simply have to
// check whether we're a browser that only supports the older Plan B SDP format (see below).
// Additionally, limiting screen sharing this way reduces our test matrix.
export function isScreenSharingSupported() {
  return isDisplayMediaAccessible() && canUnifiedPlan();
}

export function canUnifiedPlan() {
  return browserCanUnifiedPlan(getBrowserName(), getBrowserVersion());
}

export function browserCanUnifiedPlan(browserName, browserVersion) {
  if (!(browserName && browserVersion)) {
    return false;
  }
  switch (browserName) {
    case 'Chrome':
      return browserVersion.major >= 75;
    case 'Safari':
      // This is the check that Apple suggests in https://webkit.org/blog/8672/on-the-road-to-webrtc-1-0-including-vp8/,
      // plus a workaround that was already in place here for a Safari 13.0.0 bug, forcing it into Plan B.
      return (
        RTCRtpTransceiver.prototype.hasOwnProperty('currentDirection') &&
        !(
          browserVersion.major === 13 &&
          browserVersion.minor === 0 &&
          browserVersion.point === 0
        )
      );
    case 'Firefox':
      return browserVersion.major >= 67;
  }
  return false;
}

export function browserNeedsUpgrade() {
  let browser = getBrowserName(),
    ua = getUserAgent(),
    version;
  if (!ua) {
    return true;
  }
  switch (browser) {
    case 'Chrome':
      version = getChromeVersion();
      return version.major && version.major > 0 && version.major < 61;
    case 'Firefox':
      version = getFirefoxVersion();
      return version.major < 63;
    case 'Edge':
      version = getEdgeVersion();
      return version.major < 18;
    case 'Safari':
      version = getSafariVersion();
      return version.major < 12;
    case 'default':
      return true;
  }
}

export function getBrowserName() {
  if (typeof window !== 'undefined') {
    const userAgent = getUserAgent();
    // Treat supported WKWebView as Safari. Check for this first just in case
    // 3rd-party browsers on iOS decide to customize their user agent strings to
    // match the other conditions.
    if (isSupportedIOSEnvironment()) {
      return 'Safari';
    } else if (userAgent.indexOf('Edge') > -1) {
      return 'Edge';

      // }  else if (userAgent.indexOf('OPR') > -1 ||
      //            userAgent.indexOf('Opera') > -1) {
      //   return 'Opera';
    } else if (userAgent.match(/Chrome\//)) {
      return 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1) {
      return 'Safari';
    } else if (userAgent.indexOf('Firefox') > -1) {
      return 'Firefox';
    } else if (
      userAgent.indexOf('MSIE') > -1 ||
      userAgent.indexOf('.NET') > -1
    ) {
      return 'IE';
    } else {
      return 'Unknown Browser';
    }
  }
}

export function getBrowserVersion() {
  let name = getBrowserName();
  switch (name) {
    case 'Chrome':
      return getChromeVersion();
    case 'Safari':
      return getSafariVersion();
    case 'Firefox':
      return getFirefoxVersion();
    case 'Edge':
      return getEdgeVersion();
  }
}

export function getChromeVersion() {
  let major = 0,
    minor = 0,
    build = 0,
    patch = 0,
    opera = false;
  if (typeof window !== 'undefined') {
    const userAgent = getUserAgent(),
      match = userAgent.match(/Chrome\/(\d+).(\d+).(\d+).(\d+)/);
    if (match) {
      try {
        major = parseInt(match[1]);
        minor = parseInt(match[2]);
        build = parseInt(match[3]);
        patch = parseInt(match[4]);
        opera = userAgent.indexOf('OPR/') > -1;
      } catch (e) {}
    }
  }
  return { major, minor, build, patch, opera };
}

// Mobile Safari or WKWebView on iOS/iPadOS >= 14.3
export function isSupportedIOSEnvironment() {
  return isIOS() && isUserMediaAccessible();
}

function isDisplayMediaAccessible() {
  return (
    navigator &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getDisplayMedia
  );
}

function getSafariVersion() {
  let major = 0,
    minor = 0,
    point = 0;
  if (typeof window !== 'undefined') {
    const userAgent = getUserAgent(),
      match = userAgent.match(/Version\/(\d+).(\d+)(.(\d+))?/);
    if (match) {
      try {
        major = parseInt(match[1]);
        minor = parseInt(match[2]);
        point = parseInt(match[4]);
      } catch (e) {}
    } else if (isSupportedIOSEnvironment()) {
      // Hack: treat supported WKWebView like Safari 14.0.3 (no need to be
      // precise; just needs to be new enough to appear supported, and this was
      // the Safari version around the time WKWebView WebRTC support was added)
      major = 14;
      minor = 0;
      point = 3;
    }
  }
  return { major, minor, point };
}

function getFirefoxVersion() {
  let major = 0,
    minor = 0;
  if (typeof window !== 'undefined') {
    const userAgent = getUserAgent(),
      match = userAgent.match(/Firefox\/(\d+).(\d+)/);
    if (match) {
      try {
        major = parseInt(match[1]);
        minor = parseInt(match[2]);
      } catch (e) {}
    }
  }
  return { major, minor };
}

function getEdgeVersion() {
  let major = 0,
    minor = 0;
  if (typeof window !== 'undefined') {
    const userAgent = getUserAgent(),
      match = userAgent.match(/Edge\/(\d+).(\d+)/);
    if (match) {
      try {
        major = parseInt(match[1]);
        minor = parseInt(match[2]);
      } catch (e) {}
    }
  }
  return { major, minor };
}

export function browserInfo() {
  if (isReactNative()) {
    return {
      supported: true,
      mobile: true,
      name: 'React Native',
      version: null,
      supportsScreenShare: false,
      supportsSfu: true,
    };
  }

  function supportsUnifiedPlanSDP(browser) {
    return browser.satisfies({
      electron: '>=6',
      chromium: '>=75',
      chrome: '>=75',
      firefox: '>=67',
      opera: '>=61', // Corresponds to Chrome 75
      // Technically Safari 12.1 supports Unified Plan SDP, but for simplicity
      // we're just checking for 13.0.1 and above to avoid a 13.0.0 bug. 12.1
      // will fail the isDisplayMediaAccessible() check anyway.
      safari: '>=13.0.1',
      edge: '>=79', // Corresponds to Edgium
    });
  }

  function isDisplayMediaAccessible() {
    return (
      navigator &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getDisplayMedia
    );
  }

  const browser = Bowser.getParser(window.navigator.userAgent),
    basic = browser.getBrowser(),
    parsed = Bowser.parse(window.navigator.userAgent),
    isValidBrowser = browser.satisfies({
      electron: '>=6',
      chromium: '>=61',
      chrome: '>=61',
      firefox: '>=63',
      opera: '>=61',
      safari: '>=12',
      edge: '>=18',
      iOS: {
        chromium: '<0',
        chrome: '<0',
        firefox: '<0',
        opera: '<0',
        safari: '>=12',
        edge: '<0',
      },
    }),
    // See PluotUtil.isScreenSharingSupported() for a thorough explanation of this check
    supportsScreenShare = !!(
      isValidBrowser &&
      isDisplayMediaAccessible() &&
      supportsUnifiedPlanSDP(browser)
    ),
    supportsSfu = !!(isValidBrowser && !browser.satisfies({ edge: '<=18' }));

  return {
    supported: isValidBrowser,
    mobile: parsed.platform.type === 'mobile',
    name: basic.name,
    version: basic.version,
    supportsScreenShare,
    supportsSfu,
    // basic, parsed
  };
}
