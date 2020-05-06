import { browserInfo } from './shared-with-pluot-core/Environment';

export function notImplementedError() {
  throw new Error('Method must be implemented in subclass');
}

export function callObjectBundleUrl(meetingUrl) {
  // Use the CDN to get call-machine-object (but use whatever's "local" for dev+staging)
  if (process.env.NODE_ENV === 'production') {
    if (!browserInfo().supportsSfu) {
      return `https://c.daily.co/static/call-machine-object-nosfu-bundle.js`;
    } else {
      return `https://c.daily.co/static/call-machine-object-bundle.js`;
    }
  } else {
    let url = new URL(meetingUrl);
    if (!browserInfo().supportsSfu) {
      return `${url.origin}/static/call-machine-object-nosfu-bundle.js`;
    } else {
      return `${url.origin}/static/call-machine-object-bundle.js`;
    }
  }
}
