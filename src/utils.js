export function randomStringId() {
  return Date.now() + Math.random().toString();
}

export function notImplementedError() {
  throw new Error('Method must be implemented in subclass');
}

export function callObjectBundleUrl() {
  // ADVANCED: if a custom bundle URL override is specified, use that.
  if (window._dailyConfig && window._dailyConfig.callObjectBundleUrlOverride) {
    return window._dailyConfig.callObjectBundleUrlOverride;
  }

  // 1. Dev build of daily-js --> load bundle from __devCallMachineUrl__, which
  //    is either:
  //    - DEV_CALL_MACHINE_URL env variable (read at build time)
  //    - default local dev URL
  //    See webpack or rollup config for details.
  // 2. Prod build of daily-js --> load bundle from version-specific prod URL.
  return process.env.NODE_ENV === 'development'
    ? __devCallMachineUrl__
    : `https://c.daily.co/call-machine/versioned/${__dailyJsVersion__}/static/call-machine-object-bundle.js`;
}

export function validateHttpUrl(string) {
  try {
    let url = new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}
