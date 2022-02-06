import { isSfuSupported } from './shared-with-pluot-core/Environment';

export function randomStringId() {
  return Date.now() + Math.random().toString();
}

export function notImplementedError() {
  throw new Error('Method must be implemented in subclass');
}

export function callObjectBundleUrl(meetingOrBaseUrl) {
  // Take the provided URL, which is either a meeting URL (like
  // https://somecompany.daily.co/hello) or a base URL (like
  // https://somecompany.daily.co), and make it a base URL.
  let baseUrl = meetingOrBaseUrl ? new URL(meetingOrBaseUrl).origin : null;

  // Production:
  // - no url provided                  --> load bundle from c.daily.co (CDN)
  // - x.daily.co url provided          --> load bundle from c.daily.co (CDN)
  // - x.staging.daily.co url provided  --> see dev/staging logic
  if (
    process.env.NODE_ENV === 'production' &&
    (!baseUrl || baseUrl.match(/https:\/\/[^.]+\.daily\.co/))
  ) {
    if (!isSfuSupported()) {
      return `https://c.daily.co/static/call-machine-object-nosfu-bundle.js`;
    } else {
      return `https://c.daily.co/static/call-machine-object-bundle.js`;
    }
  }

  // Dev/staging:
  // - no url provided  --> error
  // - url provided     --> load bundle from url
  if (!baseUrl) {
    console.warn(
      'No baseUrl provided for call object bundle. Defaulting to production CDN...'
    );
    baseUrl = 'https://c.daily.co';
  }
  if (!isSfuSupported()) {
    return `${baseUrl}/static/call-machine-object-nosfu-bundle.js`;
  } else {
    return `${baseUrl}/static/call-machine-object-bundle.js`;
  }
}

export function validateHttpUrl(string) {
  try {
    let url = new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}
