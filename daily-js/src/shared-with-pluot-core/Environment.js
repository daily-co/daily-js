import Bowser from 'bowser';

export function isReactNative() {
  return (
    typeof navigator !== 'undefined' &&
    navigator.product &&
    navigator.product === 'ReactNative'
  );
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
