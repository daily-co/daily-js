import {
  DailyJsVersion,
  OLDEST_SUPPORTED_DAILY_JS_VERSION,
  NEARING_EOS_DAILY_JS_VERSION,
} from '../shared-with-pluot-core/DailyJsVersion';

// fake set the version on the config for DailyJsVersion to use
// so we don't have to update tests with every release
const configVersions = ['0.31.0', '0.31.0-internal.2'];

describe('constructor', () => {
  for (let i = 0; i < configVersions.length; i++) {
    it(`does right by dailyConfig (${configVersions[i]})`, () => {
      window._dailyConfig = { dailyJsVersion: configVersions[i] };

      expect(new DailyJsVersion().major).toStrictEqual(0);
      expect(new DailyJsVersion().minor).toStrictEqual(31);
      expect(new DailyJsVersion().patch).toStrictEqual(0);
      if (configVersions[i].includes('internal')) {
        expect(new DailyJsVersion().internal).toStrictEqual(2);
      } else {
        expect(new DailyJsVersion().internal).toStrictEqual(undefined);
      }
    });
  }

  it('does right by object', () => {
    let version = new DailyJsVersion({ major: 4, minor: 2, patch: 3 });
    expect(version.major).toStrictEqual(4);
    expect(version.minor).toStrictEqual(2);
    expect(version.patch).toStrictEqual(3);
    expect(version.internal).toStrictEqual(undefined);

    version = new DailyJsVersion({
      major: 6,
      minor: 1,
      patch: 5,
      internal: 2,
    });
    expect(version.major).toStrictEqual(6);
    expect(version.minor).toStrictEqual(1);
    expect(version.patch).toStrictEqual(5);
    expect(version.internal).toStrictEqual(2);
  });

  it('does right by copy', () => {
    let v1 = new DailyJsVersion({ major: 4, minor: 2, patch: 3 });
    let v2 = new DailyJsVersion(v1);
    expect(v2.major).toStrictEqual(4);
    expect(v2.minor).toStrictEqual(2);
    expect(v2.patch).toStrictEqual(3);
    expect(v2.internal).toStrictEqual(undefined);

    v1 = new DailyJsVersion({
      major: 6,
      minor: 1,
      patch: 5,
      internal: 2,
    });
    v2 = new DailyJsVersion(v1);
    expect(v2.major).toStrictEqual(6);
    expect(v2.minor).toStrictEqual(1);
    expect(v2.patch).toStrictEqual(5);
    expect(v2.internal).toStrictEqual(2);
  });

  it('does right by string', () => {
    let version = new DailyJsVersion('4.2.3');
    expect(version.major).toStrictEqual(4);
    expect(version.minor).toStrictEqual(2);
    expect(version.patch).toStrictEqual(3);
    expect(version.internal).toStrictEqual(undefined);

    version = new DailyJsVersion('4.2.3-internal.5');
    expect(version.major).toStrictEqual(4);
    expect(version.minor).toStrictEqual(2);
    expect(version.patch).toStrictEqual(3);
    expect(version.internal).toStrictEqual(5);
  });

  it('uses 0.0.0 if bad', () => {
    let version = new DailyJsVersion({ major: 4 });
    expect(version.major).toStrictEqual(0);
    expect(version.minor).toStrictEqual(0);
    expect(version.patch).toStrictEqual(0);
    expect(version.internal).toStrictEqual(undefined);

    version = new DailyJsVersion({ major: '4', minor: '2', patch: '3' });
    expect(version.major).toStrictEqual(0);
    expect(version.minor).toStrictEqual(0);
    expect(version.patch).toStrictEqual(0);
    expect(version.internal).toStrictEqual(undefined);

    version = new DailyJsVersion({
      major: 4,
      minor: 2,
      patch: 3,
      internal: 'junk',
    });
    expect(version.major).toStrictEqual(4);
    expect(version.minor).toStrictEqual(2);
    expect(version.patch).toStrictEqual(3);
    expect(version.internal).toStrictEqual(0);

    version = new DailyJsVersion('4.2');
    expect(version.major).toStrictEqual(0);
    expect(version.minor).toStrictEqual(0);
    expect(version.patch).toStrictEqual(0);
    expect(version.internal).toStrictEqual(undefined);

    version = new DailyJsVersion('4.2.3-internal');
    expect(version.major).toStrictEqual(0);
    expect(version.minor).toStrictEqual(0);
    expect(version.patch).toStrictEqual(0);
    expect(version.internal).toStrictEqual(undefined);

    version = new DailyJsVersion('4.2.foo');
    expect(version.major).toStrictEqual(0);
    expect(version.minor).toStrictEqual(0);
    expect(version.patch).toStrictEqual(0);
    expect(version.internal).toStrictEqual(undefined);

    version = new DailyJsVersion(4.2);
    expect(version.major).toStrictEqual(0);
    expect(version.minor).toStrictEqual(0);
    expect(version.patch).toStrictEqual(0);
    expect(version.internal).toStrictEqual(undefined);
  });
});

describe('isEqualToOrNewerThan', () => {
  for (let i = 0; i < configVersions.length; i++) {
    it(`returns true when equal (${configVersions[i]})`, () => {
      window._dailyConfig = { dailyJsVersion: configVersions[i] };

      expect(
        new DailyJsVersion().isEqualToOrNewerThan(new DailyJsVersion())
      ).toStrictEqual(true);
    });
  }

  it('returns true when that is older', () => {
    const thisV = new DailyJsVersion({ major: 1, minor: 1, patch: 1 });
    let thatV = new DailyJsVersion({ major: 1, minor: 1, patch: 0 });
    expect(thisV.isEqualToOrNewerThan(thatV)).toStrictEqual(true);
    thatV.patch = 1;
    thatV.minor = 0;
    expect(thisV.isEqualToOrNewerThan(thatV)).toStrictEqual(true);
    thatV.minor = 1;
    thatV.major = 0;
    expect(thisV.isEqualToOrNewerThan(thatV)).toStrictEqual(true);
  });

  it('returns false when that is newer', () => {
    const thisV = new DailyJsVersion({ major: 1, minor: 1, patch: 1 });
    let thatV = new DailyJsVersion({ major: 1, minor: 1, patch: 2 });
    expect(thisV.isEqualToOrNewerThan(thatV)).toStrictEqual(false);
    thatV.patch = 1;
    thatV.minor = 2;
    expect(thisV.isEqualToOrNewerThan(thatV)).toStrictEqual(false);
    thatV.minor = 1;
    thatV.major = 2;
    expect(thisV.isEqualToOrNewerThan(thatV)).toStrictEqual(false);
  });

  it('internal versions work too', () => {
    let pubV = new DailyJsVersion({ major: 1, minor: 1, patch: 1 });
    let intV = new DailyJsVersion('1.1.1-internal.0');
    expect(pubV.isEqualToOrNewerThan(intV)).toStrictEqual(true);
    expect(intV.isEqualToOrNewerThan(pubV)).toStrictEqual(true);
    intV.internal = 1;
    expect(pubV.isEqualToOrNewerThan(intV)).toStrictEqual(true);
    expect(intV.isEqualToOrNewerThan(pubV)).toStrictEqual(true);

    intV.patch = 0;
    expect(pubV.isEqualToOrNewerThan(intV)).toStrictEqual(true);
    expect(intV.isEqualToOrNewerThan(pubV)).toStrictEqual(false);
  });
});

describe('isNewerThan', () => {
  for (let i = 0; i < configVersions.length; i++) {
    it('returns false when equal', () => {
      window._dailyConfig = { dailyJsVersion: configVersions[i] };

      const curVersion = new DailyJsVersion();
      const thatVersion = new DailyJsVersion();
      expect(curVersion.isNewerThan(thatVersion)).toStrictEqual(false);
    });
  }

  it('returns true when that is older', () => {
    const thisV = new DailyJsVersion({ major: 1, minor: 1, patch: 1 });
    let thatV = new DailyJsVersion({ major: 1, minor: 1, patch: 0 });
    expect(thisV.isNewerThan(thatV)).toStrictEqual(true);
    thatV.patch = 1;
    thatV.minor = 0;
    expect(thisV.isNewerThan(thatV)).toStrictEqual(true);
    thatV.minor = 1;
    thatV.major = 0;
    expect(thisV.isNewerThan(thatV)).toStrictEqual(true);
  });

  it('returns false when that is newer', () => {
    const thisV = new DailyJsVersion({ major: 1, minor: 1, patch: 1 });
    let thatV = new DailyJsVersion({ major: 1, minor: 1, patch: 2 });
    expect(thisV.isNewerThan(thatV)).toStrictEqual(false);
    thatV.patch = 1;
    thatV.minor = 2;
    expect(thisV.isNewerThan(thatV)).toStrictEqual(false);
    thatV.minor = 1;
    thatV.major = 2;
    expect(thisV.isNewerThan(thatV)).toStrictEqual(false);
  });

  it('internal versions work too', () => {
    let pubV = new DailyJsVersion({ major: 1, minor: 1, patch: 1 });
    let intV = new DailyJsVersion('1.1.1-internal.0');
    expect(pubV.isNewerThan(intV)).toStrictEqual(false);
    expect(intV.isNewerThan(pubV)).toStrictEqual(false);
    intV.internal = 1;
    expect(pubV.isNewerThan(intV)).toStrictEqual(false);
    expect(intV.isNewerThan(pubV)).toStrictEqual(false);

    intV.patch = 0;
    expect(pubV.isNewerThan(intV)).toStrictEqual(true);
    expect(intV.isNewerThan(pubV)).toStrictEqual(false);
  });
});

describe('isSupported', () => {
  it('returns correctly', () => {
    let oldestV = OLDEST_SUPPORTED_DAILY_JS_VERSION;
    let version = new DailyJsVersion(oldestV);
    expect(version.isSupported()).toStrictEqual(true);
    version.minor++;
    expect(version.isSupported()).toStrictEqual(true);
    version.minor -= 2;
    expect(version.isSupported()).toStrictEqual(false);
    version.patch++;
    expect(version.isSupported()).toStrictEqual(false);
    version.minor++;
    expect(version.isSupported()).toStrictEqual(true);

    // internal treated the same
    oldestV.internal = 0;
    version = new DailyJsVersion(oldestV);
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
    let nearingV = NEARING_EOS_DAILY_JS_VERSION;
    let version = new DailyJsVersion(nearingV);
    expect(version.isNearEndOfSupport()).toStrictEqual(true);
    version.minor++;
    expect(version.isNearEndOfSupport()).toStrictEqual(false);
    version.minor -= 2;
    expect(version.isNearEndOfSupport()).toStrictEqual(true);
    version.patch++;
    expect(version.isNearEndOfSupport()).toStrictEqual(true);
    version.minor++;
    expect(version.isNearEndOfSupport()).toStrictEqual(false);

    // internal treated the same
    nearingV.internal = 0;
    version = new DailyJsVersion(nearingV);
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
    for (let i = 0; i < configVersions.length; i++) {
      window._dailyConfig = { dailyJsVersion: configVersions[i] };
      expect(new DailyJsVersion().toString()).toStrictEqual(configVersions[i]);
    }
    let version = new DailyJsVersion({ major: 4, minor: 2, patch: 3 });
    expect(version.toString()).toStrictEqual('4.2.3');
    expect(`${version}`).toStrictEqual('4.2.3');
    version.internal = 5;
    expect(version.toString()).toStrictEqual('4.2.3-internal.5');
    expect(`${version}`).toStrictEqual('4.2.3-internal.5');
  });
});

describe('fromString', () => {
  it('parses correctly', () => {
    let versionStr = '4.2.3';
    let expectedVersion = new DailyJsVersion({
      major: 4,
      minor: 2,
      patch: 3,
    });
    let actualVersion = DailyJsVersion.fromString(versionStr);
    expect(actualVersion.major).toStrictEqual(expectedVersion.major);
    expect(actualVersion.minor).toStrictEqual(expectedVersion.minor);
    expect(actualVersion.patch).toStrictEqual(expectedVersion.patch);
    expect(actualVersion.internal).toStrictEqual(expectedVersion.internal);
    expect(actualVersion.toString()).toStrictEqual(versionStr);

    // now with an internal one
    versionStr = '4.2.3-internal.5';
    expectedVersion = new DailyJsVersion({
      major: 4,
      minor: 2,
      patch: 3,
      internal: 5,
    });
    actualVersion = DailyJsVersion.fromString(versionStr);
    expect(actualVersion.major).toStrictEqual(expectedVersion.major);
    expect(actualVersion.minor).toStrictEqual(expectedVersion.minor);
    expect(actualVersion.patch).toStrictEqual(expectedVersion.patch);
    expect(actualVersion.internal).toStrictEqual(expectedVersion.internal);
    expect(actualVersion.toString()).toStrictEqual(versionStr);
  });
});
