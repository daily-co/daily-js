import DailyIframe from '../module';
import {
  MAX_SESSION_DATA_SIZE,
  MAX_USER_DATA_SIZE,
} from '../shared-with-pluot-core/CommonIncludes';
// const { createCallObject } = DailyIframe;

// let djs;

// const versionFn = () => {
//   return 'JEST_VERSION';
// };

// beforeEach(() => {
//   delete DailyIframe.version;
//   DailyIframe.version = versionFn;
//   djs = createCallObject();
// });

const validateRMPEncodeFunc = DailyIframe.__get__(
  'validateRemotePlayerEncodingSettings'
);

it('Track constraints must be Object Type', () => {
  const validateTcIsObject = {
    state: 'play',
    simulcastEncodings: [{}],
  };

  expect(() => validateRMPEncodeFunc(validateTcIsObject)).toThrowError();
});

const validateSessionDataFunc = DailyIframe.__get__(
  'validateSessionDataUpdate'
);

it('Session data merge strategy must be valid', () => {
  expect(() => validateSessionDataFunc({}, 'merge')).toThrow(
    /Unrecognized mergeStrategy/
  );
  expect(validateSessionDataFunc({}, 'shallow-merge')).toEqual(true);
  expect(validateSessionDataFunc({}, 'replace')).toEqual(true);
});

it('Session data must be serializable to JSON', () => {
  const circularReference = {};
  circularReference.myself = circularReference;
  expect(() => validateSessionDataFunc(circularReference, 'replace')).toThrow(
    /must be serializable/
  );
  expect(validateSessionDataFunc({ foo: 3 }, 'replace')).toEqual(true);
});

it('Session data must be a plain object', () => {
  expect(() => validateSessionDataFunc(null, 'replace')).toThrow(/plain/);
  expect(() => validateSessionDataFunc(undefined, 'replace')).toThrow(/plain/);
});

it('Session data should not exceed max character limit', () => {
  let strData = '';
  const scaffolding = '"{"a":}"';
  for (let i = 0; i < MAX_SESSION_DATA_SIZE - scaffolding.length; i++) {
    strData += '0';
  }
  expect(validateSessionDataFunc({ a: strData }, 'replace')).toEqual(true);
  strData += '0';
  expect(() => validateSessionDataFunc({ a: strData }, 'replace')).toThrow(
    /too large/
  );
});

const validateUserDataFunc = DailyIframe.__get__('validateUserData');

it('User data must be serializable to JSON', () => {
  const circularReference = {};
  circularReference.myself = circularReference;
  expect(() => validateUserDataFunc(circularReference)).toThrow(
    /must be serializable/
  );
  expect(validateUserDataFunc(1)).toEqual(true);
  expect(validateUserDataFunc('2')).toEqual(true);
  expect(validateUserDataFunc({ foo: 3 })).toEqual(true);
  expect(validateUserDataFunc([4, 5])).toEqual(true);
  expect(validateUserDataFunc(null)).toEqual(true);
  expect(validateUserDataFunc(undefined)).toEqual(true);
});

it('User data should not exceed max character limit', () => {
  let data = '';
  for (let i = 0; i < MAX_USER_DATA_SIZE; i++) {
    data += '0';
  }
  expect(validateUserDataFunc(data)).toEqual(true);
  data += '0';
  expect(() => validateUserDataFunc(data)).toThrow(/too large/);
});
