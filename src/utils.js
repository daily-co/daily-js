export function randomStringId() {
  return Date.now() + Math.random().toString();
}

export function notImplementedError() {
  throw new Error('Method must be implemented in subclass');
}

// Ordered registrable domains for loading Daily's call-machine bundle and
// reaching Daily's services. daily.co is primary; dailywebrtc.com / .net are
// fallbacks for when the .co TLD's authoritative nameservers are unreachable (a
// recurring outage — see ENG-9038). The bundle loader tries these in order;
// whichever succeeds is remembered for the rest of the page's lifetime and
// threaded into every downstream URL so the session stays on one domain.
export const DAILY_DOMAINS = ['daily.co', 'dailywebrtc.com', 'dailywebrtc.net'];

// In-memory (per page load) record of the registrable domain the bundle last
// loaded from. Lets repeated loads skip straight to the known-good domain
// instead of re-incurring a dead primary's timeout. Intentionally NOT persisted:
// a fresh page load re-checks the primary (daily.co) first.
let resolvedBaseDomain = null;

export function getResolvedBaseDomain() {
  return resolvedBaseDomain;
}

export function setResolvedBaseDomain(domain) {
  // null clears it (e.g. a custom/override bundle URL loaded — don't keep a
  // stale resolved domain). Otherwise only accept a known Daily domain.
  if (domain === null || DAILY_DOMAINS.includes(domain)) {
    resolvedBaseDomain = domain;
  }
}

// Returns the registrable Daily domain a URL belongs to (one of DAILY_DOMAINS),
// or null for custom/override URLs.
export function baseDomainFromUrl(url) {
  try {
    const host = new URL(url).hostname;
    return (
      DAILY_DOMAINS.find((d) => host === d || host.endsWith(`.${d}`)) || null
    );
  } catch (_) {
    return null;
  }
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

export function bundlePath(dailyConfig, domain = DAILY_DOMAINS[0]) {
  // ADVANCED: if a custom bundle path override is specified, use that.
  if (dailyConfig?.bundlePathOverride) {
    const url = dailyConfig.bundlePathOverride;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  if (dailyConfig?.callObjectBundleUrlOverride) {
    // Note: This should never happen since the only thing that calls bundlePath is
    // callObjectBundleUrl, which returns early if callObjectBundleUrlOverride is set.
    const url = dailyConfig.callObjectBundleUrlOverride;
    const dir = url.substring(0, url.lastIndexOf('/'));
    return dir.endsWith('/') ? dir.slice(0, -1) : dir;
  }

  // 1. Dev build of daily-js --> load bundle from __devBundlePath__, which
  //    is either:
  //    - DEV_BUNDLE_PATH env variable (read at build time)
  //    - default local dev URL
  //    See webpack or rollup config for details.
  // 2. Prod build of daily-js --> load bundle from version-specific prod URL.
  //    `domain` selects the registrable base domain (daily.co or a fallback).
  let url =
    process.env.NODE_ENV === 'development'
      ? __devBundlePath__
      : maybeProxyHttpsUrl(
          `https://c.${domain}/call-machine/versioned/${__dailyJsVersion__}/static`,
          dailyConfig
        );
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function callObjectBundleUrl(dailyConfig, domain = DAILY_DOMAINS[0]) {
  // ADVANCED: if a custom bundle URL override is specified, use that.
  if (dailyConfig?.callObjectBundleUrlOverride) {
    console.warn(
      'The callObjectBundleUrlOverride property is deprecated and will be removed.' +
        ' Please use bundlePathOverride instead. When providing a bundlePathOverride,' +
        ' the URL should point to the directory containing all Daily bundles' +
        ' (call-machine-object-bundle.js and audio-processor-bundle.js).'
    );
    return dailyConfig.callObjectBundleUrlOverride;
  }

  const url =
    bundlePath(dailyConfig, domain) + '/call-machine-object-bundle.js';
  return url;
}

// localStorage key for the server-controlled kill switch. The call machine
// writes it from the room config's disable_domain_fallback (see
// js/stores/lifecycle/actionCreators.js); the loader reads it here. Persisted
// (not in dailyConfig) because room config isn't available at bundle-load time,
// so a flip only takes effect on the next page load.
const DISABLE_DOMAIN_FALLBACK_KEY = 'daily:disable-domain-fallback';

function domainFallbackKilled() {
  try {
    return (
      typeof localStorage !== 'undefined' &&
      localStorage.getItem(DISABLE_DOMAIN_FALLBACK_KEY) === '1'
    );
  } catch (_) {
    // localStorage may throw (privacy mode / sandboxed iframe); treat as enabled.
    return false;
  }
}

// Whether bundle-load failover across DAILY_DOMAINS applies. It does not when an
// explicit routing directive (override or proxy) is set, in dev builds, or when
// the server kill switch has been persisted — in those cases there is exactly
// one bundle URL and we must respect it.
function bundleFailoverDisabled(dailyConfig) {
  return Boolean(
    dailyConfig?.callObjectBundleUrlOverride ||
      dailyConfig?.bundlePathOverride ||
      dailyConfig?.proxyUrl ||
      process.env.NODE_ENV === 'development' ||
      domainFallbackKilled()
  );
}

// Ordered list of bundle URLs the loader should try. A single URL when failover
// is disabled; otherwise one per DAILY_DOMAIN, with any already-resolved domain
// moved to the front (sticky) so we don't re-incur a dead primary's timeout.
export function callObjectBundleUrlCandidates(dailyConfig) {
  if (bundleFailoverDisabled(dailyConfig)) {
    return [callObjectBundleUrl(dailyConfig)];
  }
  const ordered = resolvedBaseDomain
    ? [
        resolvedBaseDomain,
        ...DAILY_DOMAINS.filter((d) => d !== resolvedBaseDomain),
      ]
    : DAILY_DOMAINS;
  return ordered.map((domain) => callObjectBundleUrl(dailyConfig, domain));
}

export function validateHttpUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}
