export function randomStringId() {
  return Date.now() + Math.random().toString();
}

export function notImplementedError() {
  throw new Error('Method must be implemented in subclass');
}

export function callObjectBundleUrl(meetingOrBaseUrl) {
  // ADVANCED: if a custom bundle URL override is specified, use that.
  if (window._dailyConfig && window._dailyConfig.callObjectBundleUrlOverride) {
    return window._dailyConfig.callObjectBundleUrlOverride;
  }

  // Take the provided URL, which is either a meeting URL (like
  // https://somecompany.daily.co/hello) or a base URL (like
  // https://somecompany.daily.co), and make it a base URL.
  let baseUrl = meetingOrBaseUrl ? new URL(meetingOrBaseUrl).origin : null;

  function bundleUrlFromBaseUrl(url) {
    return `${url}/static/call-machine-object-bundle.js`;
  }

  function cdnBundleUrl({ isStaging = false } = {}) {
    return `https://c${
      isStaging ? '.staging' : ''
    }.daily.co/call-machine/versioned/${__dailyJsVersion__}/static/call-machine-object-bundle.js`;
  }

  // 1. No URL      --> load bundle from prod CDN
  // 2. Prod URL    --> load bundle from prod CDN
  // 3. Preview URL --> load bundle from preview web app
  // 4. Staging URL --> load bundle from staging CDN
  // 5. Other URL   --> load bundle from web app (same origin as meetingOrBaseUrl)
  // -----
  // 1.
  if (!baseUrl) {
    return cdnBundleUrl();
  }
  // 2.
  if (baseUrl.match(/https:\/\/[^.]+\.daily\.co/)) {
    return cdnBundleUrl();
  }
  // 3.
  if (baseUrl.match(/https:\/\/preview-[^.]+\.staging\.daily\.co/)) {
    return bundleUrlFromBaseUrl(baseUrl);
  }
  // 4.
  if (baseUrl.match(/https:\/\/[^.]+\.staging\.daily\.co/)) {
    return cdnBundleUrl({ isStaging: true });
  }
  // 5.
  return bundleUrlFromBaseUrl(baseUrl);
}

export function validateHttpUrl(string) {
  try {
    let url = new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}
