export function randomStringId() {
  return Date.now() + Math.random().toString();
}

export function notImplementedError() {
  throw new Error('Method must be implemented in subclass');
}

// url assumed to start with 'https://'
export function maybeProxyHttpsUrl(url, dailyConfig) {
  if (dailyConfig?.proxyUrl) {
    return (
      dailyConfig.proxyUrl +
      (dailyConfig.proxyUrl.slice(-1) === '/' ? '' : '/') +
      url.substring(8)
    );
  }
  return url;
}

export function bundlePath(dailyConfig) {
  // ADVANCED: if a custom bundle path override is specified, use that.
  if (dailyConfig?.bundlePathOverride) {
    return dailyConfig.bundlePathOverride;
  }
  if (dailyConfig?.callObjectBundleUrlOverride) {
    const url = dailyConfig.callObjectBundleUrlOverride;
    return url.substring(0, url.lastIndexOf('/'));
  }

  // 1. Dev build of daily-js --> load bundle from __devBundlePath__, which
  //    is either:
  //    - DEV_CALL_MACHINE_URL env variable (read at build time)
  //    - default local dev URL
  //    See webpack or rollup config for details.
  // 2. Prod build of daily-js --> load bundle from version-specific prod URL.
  let url =
    process.env.NODE_ENV === 'development'
      ? __devBundlePath__
      : maybeProxyHttpsUrl(
          `https://c.daily.co/call-machine/versioned/${__dailyJsVersion__}/static`,
          dailyConfig
        );
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function callObjectBundleUrl(dailyConfig) {
  // ADVANCED: if a custom bundle URL override is specified, use that.
  if (dailyConfig?.callObjectBundleUrlOverride) {
    console.warn(
      'The callObjectBundleUrlOverride property is deprecated and will be removed.' +
        ' Please use bundlePathOverride instead. When providing a bundlePathOverride,' +
        ' the URL should point to a folder containing all Daily bundles;' +
        ' call-machine-object-bundle.js and 460-bundle.js.'
    );
    return dailyConfig.callObjectBundleUrlOverride;
  }

  const url = bundlePath(dailyConfig) + '/call-machine-object-bundle.js';
  return url;
}

export function validateHttpUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}
