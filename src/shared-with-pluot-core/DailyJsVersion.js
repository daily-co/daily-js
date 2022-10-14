//--------------------------------
// daily-js version helpers

// Daily supports the last 6 months of versions.
// These variable should be updated as part of each release as needed.

// OLDEST should match the oldest version that is exactly 6 months or
// less at the time of each release.
export const OLDEST_SUPPORTED_DAILY_JS_VERSION = {
  major: 0,
  minor: 24,
  patch: 0,
};

// NEARING should be a version roughly 1 month out from being unsupported
// to give customers ample time to upgrade.
export const NEARING_EOS_DAILY_JS_VERSION = {
  major: 0,
  minor: 25,
  patch: 0,
};

function _getDailyJsVersion() {
  if (typeof _dailyConfig !== 'undefined' && _dailyConfig.dailyJsVersion) {
    return _dailyConfig.dailyJsVersion;
  }
  return undefined;
}

export class DailyJsVersion {
  constructor(
    { major, minor, patch } = DailyJsVersion.fromString(_getDailyJsVersion())
  ) {
    // keep it simple. don't support non-number versions or partial
    // i.e. if you declare one, you have to declare them all.
    if (
      typeof major !== 'number' ||
      typeof minor !== 'number' ||
      typeof patch !== 'number'
    ) {
      major = minor = patch = 0;
    }
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  isThisDailyJsVersionAtLeastThat(thatV) {
    if (this.major !== thatV.major) {
      return this.major > thatV.major;
    }
    if (this.minor !== thatV.minor) {
      return this.minor > thatV.minor;
    }
    return this.patch >= thatV.patch;
  }

  isThisDailyJsVersionNewerThanThat(thatV) {
    if (this.major !== thatV.major) {
      return this.major > thatV.major;
    }
    if (this.minor !== thatV.minor) {
      return this.minor > thatV.minor;
    }
    return this.patch > thatV.patch;
  }

  isSupported() {
    return this.isThisDailyJsVersionAtLeastThat(
      OLDEST_SUPPORTED_DAILY_JS_VERSION
    );
  }

  isNearEndOfSupport() {
    return !this.isThisDailyJsVersionNewerThanThat(
      NEARING_EOS_DAILY_JS_VERSION
    );
  }

  toString() {
    return `${this.major}.${this.minor}.${this.patch}`;
  }

  static fromString(versionString) {
    let major = 0,
      minor = 0,
      patch = 0;
    try {
      const versionParts = versionString.split('.');
      major = parseInt(versionParts[0], 10);
      minor = parseInt(versionParts[1], 10);
      patch = parseInt(versionParts[2], 10);
    } catch (e) {}
    return new DailyJsVersion({ major, minor, patch });
  }
}
