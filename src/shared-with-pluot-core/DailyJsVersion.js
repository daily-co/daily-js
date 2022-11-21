//--------------------------------
// daily-js version helpers

// Daily supports the last 6 months of versions.
// These variable should be updated as part of each release as needed.

// OLDEST SUPPORTED should match the oldest version that is exactly
// 6 months or less at the time of each release.
export const OLDEST_SUPPORTED_DAILY_JS_VERSION = {
  major: 0,
  minor: 25,
  patch: 0,
};

// NEARING END OF SUPPORT should be a version roughly 1 month out
// from being unsupported to give customers ample time to upgrade.
export const NEARING_EOS_DAILY_JS_VERSION = {
  major: 0,
  minor: 26,
  patch: 0,
};

// OLDEST LIVING should match the oldest version that can still
// connect and work with our servers. Anything older will be
// rejected from the meeting. Any version older than this (rejected)
// should be at least 9 months old
// To begin: There are no official eol versions
export const OLDEST_LIVING_DAILY_JS_VERSION = {
  major: -1,
  minor: 0,
  patch: 0,
};

// NEARING END OF LIFE should be a version roughly 1 month out
// from being truly end-of-life. This version should be at least
// 8 months old
// To begin: There are no official eol versions
export const NEARING_EOL_DAILY_JS_VERSION = {
  major: -1,
  minor: 0,
  patch: 0,
};

export const DAILY_CLIENT_SUPPORT_STATE = {
  SUPPORTED: 'supported',
  NEARING_EOS: 'nearing-eos',
  UNSUPPORTED: 'unsupported',
  NEARING_EOL: 'nearing-eol',
  EOL: 'eol',
  UNKNOWN: 'unknown', // for completeness
};

function _getDailyJsVersion() {
  if (typeof _dailyConfig !== 'undefined' && _dailyConfig.dailyJsVersion) {
    return _dailyConfig.dailyJsVersion;
  }
  return undefined;
}

export class DailyJsVersion {
  // Allow version to be provided as a string, object, or other DailyJSVersion
  constructor(version = _getDailyJsVersion()) {
    // For any non-internal versions, `internal` will be `undefined`
    let djv = { major: 0, minor: 0, patch: 0, internal: undefined };
    if (typeof version === 'string') {
      djv = DailyJsVersion.fromString(version);
    } else if (typeof version === 'object') {
      // keep it simple. don't support non-number versions or partial
      // i.e. if you declare one, you have to declare them all.
      if (
        typeof version.major === 'number' &&
        typeof version.minor === 'number' &&
        typeof version.patch === 'number'
      ) {
        djv = version;
      }
      // zero out the internal key if it's not valid
      // TODO: is this the right thing? OR if it's provided and the wrong
      // type, should we invalidate (0 out) the whole thing?
      // NOTE: this should be a theoretical exercise anyway
      if (version.internal && typeof version.internal !== 'number') {
        djv.internal = -1;
      }
    }
    this.major = djv.major;
    this.minor = djv.minor;
    this.patch = djv.patch;
    this.internal = djv.internal;
  }

  isEqualToOrNewerThan(thatV) {
    if (this.isNewerThan(thatV)) {
      return true;
    }
    let that = new DailyJsVersion(thatV);
    return (
      this.major === that.major &&
      this.minor === that.minor &&
      this.patch === that.patch &&
      this.internal === that.internal
    );
  }

  isNewerThan(thatV) {
    let that = new DailyJsVersion(thatV);

    if (this.major !== that.major) {
      return this.major > that.major;
    }
    if (this.minor !== that.minor) {
      return this.minor > that.minor;
    }
    if (this.patch !== that.patch) {
      return this.patch > that.patch;
    }

    // major/minor/patch are equal, so now things get
    // complicated. Internal releases are actually
    // pre-releases, so we need to make sure that a pre-release
    // is deemed older than an equivalent public release.
    // Example: 0.32.0 is actually newer than 0.32.0-internal.9999
    // So artificially set public internal versions to infinity for
    // ease of comparison
    let thisInternal = this.isInternal() ? this.internal : Infinity;
    let thatInternal = that.isInternal() ? that.internal : Infinity;
    if (thisInternal !== thatInternal) {
      return thisInternal > thatInternal;
    }

    // if we're here, then all-the-things are equal, so...
    // no, it's not newer
    return false;
  }

  supportState() {
    if (this.isNewerThan(NEARING_EOS_DAILY_JS_VERSION)) {
      return DAILY_CLIENT_SUPPORT_STATE.SUPPORTED;
    }
    if (this.isEqualToOrNewerThan(OLDEST_SUPPORTED_DAILY_JS_VERSION)) {
      return DAILY_CLIENT_SUPPORT_STATE.NEARING_EOS;
    }
    if (this.isNewerThan(NEARING_EOL_DAILY_JS_VERSION)) {
      return DAILY_CLIENT_SUPPORT_STATE.UNSUPPORTED;
    }
    if (this.isEqualToOrNewerThan(OLDEST_LIVING_DAILY_JS_VERSION)) {
      return DAILY_CLIENT_SUPPORT_STATE.NEARING_EOL;
    }
    return DAILY_CLIENT_SUPPORT_STATE.EOL;
  }

  isSupported() {
    return this.isEqualToOrNewerThan(OLDEST_SUPPORTED_DAILY_JS_VERSION);
  }

  isNearEndOfSupport() {
    return !this.isNewerThan(NEARING_EOS_DAILY_JS_VERSION);
  }

  isInternal() {
    return typeof this.internal === 'number';
  }

  toString() {
    const base = `${this.major}.${this.minor}.${this.patch}`;
    return this.isInternal() ? `${base}-internal.${this.internal}` : base;
  }

  static fromString(versionString) {
    let major = 0,
      minor = 0,
      patch = 0;
    let internal;
    try {
      let strCpy = versionString;
      let isInternal = strCpy.includes('internal');
      if (isInternal) {
        strCpy = strCpy.replace('-internal', '');
      }
      const versionParts = strCpy.split('.');
      if (
        (isInternal && versionParts.length !== 4) ||
        (!isInternal && versionParts.length !== 3)
      ) {
        throw new Error(`malformed version string: ${versionString}`);
      }

      major = parseInt(versionParts[0], 10);
      minor = parseInt(versionParts[1], 10);
      patch = parseInt(versionParts[2], 10);
      if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
        major = minor = patch = 0;
        throw new Error(`malformed version string: ${versionString}`);
      }

      if (isInternal) {
        internal = parseInt(versionParts[3], 10);
        if (isNaN(internal)) {
          internal = -1;
          throw new Error(`malformed version string: ${versionString}`);
        }
      }
    } catch (e) {
      console.error(`${e}`);
    }
    return new DailyJsVersion({ major, minor, patch, internal });
  }
}
