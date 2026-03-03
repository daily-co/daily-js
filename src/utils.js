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
  const normalizeUrl = (url) => {
    const normalized = url.endsWith('/') ? url.slice(0, -1) : url;
    if (!normalized.endsWith('/static') && !normalized.endsWith('\\static')) {
      return null;
    }
    return normalized;
  };
  if (dailyConfig?.bundlePathOverride) {
    const normalized = normalizeUrl(dailyConfig.bundlePathOverride);
    if (normalized) {
      return normalized;
    }
    console.warn(
      'bundlePathOverride must point to a URL ending in "static" ' +
        '(e.g. "https://example.com/v1/static"). This override will be ignored.'
    );
  }
  if (dailyConfig?.callObjectBundleUrlOverride) {
    // Note: This should never happen since the only thing that calls bundlePath is
    // callObjectBundleUrl, which returns early if callObjectBundleUrlOverride is set.
    let url = dailyConfig.callObjectBundleUrlOverride;
    url = url.substring(0, url.lastIndexOf('/'));
    const normalized = normalizeUrl(url);
    if (normalized) {
      return normalized;
    }
    console.warn(
      'callObjectBundleUrlOverride is deprecated. Please use bundlePathOverride instead. ' +
        'The URL provided must point to a folder named "static" containing all Daily bundles;' +
        ' including call-machine-object-bundle.js and audio-processor-bundle.js. ' +
        'This override will be ignored.'
    );
  }

  // 1. Dev build of daily-js --> load bundle from __devBundlePath__, which
  //    is either:
  //    - DEV_BUNDLE_PATH env variable (read at build time)
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
        ' the URL should point to a folder named "static" containing all Daily bundles;' +
        ' including call-machine-object-bundle.js and audio-processor-bundle.js.'
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
