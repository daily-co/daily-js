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
    const override = dailyConfig.bundlePathOverride;
    const normalized = override.endsWith('/')
      ? override.slice(0, -1)
      : override;
    if (!normalized.endsWith('/static') && !normalized.endsWith('\\static')) {
      console.warn(
        'Daily: bundlePathOverride must point to a URL ending in "static" ' +
          '(e.g. "https://example.com/v1/static"). The override will be ignored.'
      );
    } else {
      return normalized;
    }
  }
  if (dailyConfig?.callObjectBundleUrlOverride) {
    const url = dailyConfig.callObjectBundleUrlOverride;
    return url.substring(0, url.lastIndexOf('/'));
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
