export function notImplementedError() {
  throw new Error("Method must be implemented in subclass");
}

export function callObjectBundleUrl(meetingUrl) {
  // Use the CDN to get call-machine-object (but use whatever's "local" for dev+staging)
  if (process.env.NODE_ENV === "production") {
    return `https://c.daily.co/static/call-machine-object-bundle.js`;
  } else {
    let url = new URL(meetingUrl);
    return `${url.origin}/static/call-machine-object-bundle.js`;
  }
}
