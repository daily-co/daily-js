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
