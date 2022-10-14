import {
  DailyJsVersion,
  OLDEST_SUPPORTED_DAILY_JS_VERSION,
  NEARING_EOS_DAILY_JS_VERSION,
} from '../shared-with-pluot-core/DailyJsVersion';

// fake set the version on the config for DailyJsVersion to use
// so we don't have to update tests with every release
window._dailyConfig = { dailyJsVersion: '0.31.0' };

describe('constructor', () => {
  it('does right by default', () => {
    expect(new DailyJsVersion().major).toStrictEqual(0);
    expect(new DailyJsVersion().minor).toStrictEqual(31);
    expect(new DailyJsVersion().patch).toStrictEqual(0);
  });

  it('does right by value', () => {
    const version = new DailyJsVersion({ major: 4, minor: 2, patch: 3 });
    expect(version.major).toStrictEqual(4);
    expect(version.minor).toStrictEqual(2);
    expect(version.patch).toStrictEqual(3);
  });

  it('uses 0.0.0 if bad', () => {
    let version = new DailyJsVersion({ major: 4 });
    expect(version.major).toStrictEqual(0);
    expect(version.minor).toStrictEqual(0);
    expect(version.patch).toStrictEqual(0);

    version = new DailyJsVersion({ major: '4', minor: '2', patch: '3' });
    expect(version.major).toStrictEqual(0);
    expect(version.minor).toStrictEqual(0);
    expect(version.patch).toStrictEqual(0);
  });
});

describe('isThisDailyJsVersionAtLeastThat', () => {
  it('returns true when equal', () => {
    expect(
      new DailyJsVersion().isThisDailyJsVersionAtLeastThat(new DailyJsVersion())
    ).toStrictEqual(true);
  });

  it('returns true when that is older', () => {
    const curVersion = new DailyJsVersion({ major: 1, minor: 1, patch: 1 });
    let thatVersion = new DailyJsVersion({ major: 1, minor: 1, patch: 0 });
    expect(
      curVersion.isThisDailyJsVersionAtLeastThat(thatVersion)
    ).toStrictEqual(true);
    thatVersion.patch = 1;
    thatVersion.minor = 0;
    expect(
      curVersion.isThisDailyJsVersionAtLeastThat(thatVersion)
    ).toStrictEqual(true);
    thatVersion.minor = 1;
    thatVersion.major = 0;
    expect(
      curVersion.isThisDailyJsVersionAtLeastThat(thatVersion)
    ).toStrictEqual(true);
  });

  it('returns false when that is newer', () => {
    const curVersion = new DailyJsVersion({ major: 1, minor: 1, patch: 1 });
    let thatVersion = new DailyJsVersion({ major: 1, minor: 1, patch: 2 });
    expect(
      curVersion.isThisDailyJsVersionAtLeastThat(thatVersion)
    ).toStrictEqual(false);
    thatVersion.patch = 1;
    thatVersion.minor = 2;
    expect(
      curVersion.isThisDailyJsVersionAtLeastThat(thatVersion)
    ).toStrictEqual(false);
    thatVersion.minor = 1;
    thatVersion.major = 2;
    expect(
      curVersion.isThisDailyJsVersionAtLeastThat(thatVersion)
    ).toStrictEqual(false);
  });
});

describe('isThisDailyJsVersionNewerThanThat', () => {
  it('temp', () => {
    let isReactNative = () => {
      return true;
    };
    expect(
      isReactNative() &&
        new DailyJsVersion().isThisDailyJsVersionAtLeastThat(
          new DailyJsVersion({ major: 0, minor: 27, patch: 0 })
        )
    ).toStrictEqual(true);
  });
  it('returns false when equal', () => {
    const curVersion = new DailyJsVersion();
    const thatVersion = new DailyJsVersion();
    expect(
      curVersion.isThisDailyJsVersionNewerThanThat(thatVersion)
    ).toStrictEqual(false);
  });

  it('returns true when that is older', () => {
    const curVersion = new DailyJsVersion({ major: 1, minor: 1, patch: 1 });
    let thatVersion = new DailyJsVersion({ major: 1, minor: 1, patch: 0 });
    expect(
      curVersion.isThisDailyJsVersionNewerThanThat(thatVersion)
    ).toStrictEqual(true);
    thatVersion.patch = 1;
    thatVersion.minor = 0;
    expect(
      curVersion.isThisDailyJsVersionNewerThanThat(thatVersion)
    ).toStrictEqual(true);
    thatVersion.minor = 1;
    thatVersion.major = 0;
    expect(
      curVersion.isThisDailyJsVersionNewerThanThat(thatVersion)
    ).toStrictEqual(true);
  });

  it('returns false when that is newer', () => {
    const curVersion = new DailyJsVersion({ major: 1, minor: 1, patch: 1 });
    let thatVersion = new DailyJsVersion({ major: 1, minor: 1, patch: 2 });
    expect(
      curVersion.isThisDailyJsVersionNewerThanThat(thatVersion)
    ).toStrictEqual(false);
    thatVersion.patch = 1;
    thatVersion.minor = 2;
    expect(
      curVersion.isThisDailyJsVersionNewerThanThat(thatVersion)
    ).toStrictEqual(false);
    thatVersion.minor = 1;
    thatVersion.major = 2;
    expect(
      curVersion.isThisDailyJsVersionNewerThanThat(thatVersion)
    ).toStrictEqual(false);
  });
});

describe('isSupported', () => {
  it('returns correctly', () => {
    let version = new DailyJsVersion(OLDEST_SUPPORTED_DAILY_JS_VERSION);
    expect(version.isSupported()).toStrictEqual(true);
    version.minor++;
    expect(version.isSupported()).toStrictEqual(true);
    version.minor -= 2;
    expect(version.isSupported()).toStrictEqual(false);
    version.patch++;
    expect(version.isSupported()).toStrictEqual(false);
    version.minor++;
    expect(version.isSupported()).toStrictEqual(true);
  });
});

describe('isNearEndOfSupport', () => {
  it('returns correctly', () => {
    let version = new DailyJsVersion(NEARING_EOS_DAILY_JS_VERSION);
    expect(version.isNearEndOfSupport()).toStrictEqual(true);
    version.minor++;
    expect(version.isNearEndOfSupport()).toStrictEqual(false);
    version.minor -= 2;
    expect(version.isNearEndOfSupport()).toStrictEqual(true);
    version.patch++;
    expect(version.isNearEndOfSupport()).toStrictEqual(true);
    version.minor++;
    expect(version.isNearEndOfSupport()).toStrictEqual(false);
  });
});

describe('toString', () => {
  it('stringifies correctly', () => {
    const version = new DailyJsVersion({ major: 4, minor: 2, patch: 3 });
    expect(version.toString()).toStrictEqual('4.2.3');
    expect(new DailyJsVersion().toString()).toStrictEqual('0.31.0');
    expect(`${version}`).toStrictEqual('4.2.3');
  });
});

describe('fromString', () => {
  it('parses correctly', () => {
    const versionStr = '4.2.3';
    const expectedVersion = new DailyJsVersion({
      major: 4,
      minor: 2,
      patch: 3,
    });
    const actualVersion = DailyJsVersion.fromString(versionStr);
    expect(actualVersion.major).toStrictEqual(expectedVersion.major);
    expect(actualVersion.minor).toStrictEqual(expectedVersion.minor);
    expect(actualVersion.patch).toStrictEqual(expectedVersion.patch);
    expect(actualVersion.toString()).toStrictEqual(versionStr);
  });
});
