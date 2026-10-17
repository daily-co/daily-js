import Daily from '../module';
import {
  MAX_SESSION_DATA_SIZE,
  MAX_USER_DATA_SIZE,
} from '../shared-with-pluot-core/CommonIncludes';
// const { createCallObject } = Daily;

// let djs;

// const versionFn = () => {
//   return 'JEST_VERSION';
// };

// beforeEach(() => {
//   delete Daily.version;
//   Daily.version = versionFn;
//   djs = createCallObject();
// });

const validateRMPEncodeFunc = Daily.__get__(
  'validateRemotePlayerEncodingSettings'
);

it('Track constraints must be Object Type', () => {
  const validateTcIsObject = {
    state: 'play',
    simulcastEncodings: [{}],
  };

  expect(() => validateRMPEncodeFunc(validateTcIsObject)).toThrow();
});

const validateSessionDataFunc = Daily.__get__('validateSessionDataUpdate');

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

const validateUserDataFunc = Daily.__get__('validateUserData');

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

const validateSipVideoSettingsFunc = Daily.__get__('validateSipVideoSettings');

describe('validateSipVideoSettings', () => {
  const dialOut =
    (videoSettings, video = true) =>
    () =>
      validateSipVideoSettingsFunc(
        videoSettings,
        video,
        'Error starting dial out'
      );

  it('accepts no settings, and the encoding fields within their limits', () => {
    expect(dialOut(undefined, false)).not.toThrow();
    expect(
      dialOut({ width: 1280, height: 720, fps: 30, videoBitrate: 1000 })
    ).not.toThrow();
    expect(
      dialOut({ width: 720, height: 1280, layout: { preset: 'sip-portrait' } })
    ).not.toThrow();
  });

  it('turns the dims caps 9:16 for sip-portrait', () => {
    const layout = { preset: 'sip-portrait' };
    expect(dialOut({ width: 1280, layout })).toThrow(
      'videoSettings.width must be less than or equal to 720'
    );
    expect(dialOut({ height: 1281, layout })).toThrow(
      'videoSettings.height must be less than or equal to 1280'
    );
    expect(dialOut({ height: 1280, layout: { preset: 'sip-grid' } })).toThrow(
      'videoSettings.height must be less than or equal to 720'
    );
  });

  it('keeps the checks that used to be inline in startDialOut', () => {
    expect(dialOut('x')).toThrow(
      'Error starting dial out: videoSettings must be an object'
    );
    expect(dialOut({}, false)).toThrow(
      'videoSettings provided but video is not enabled'
    );
    expect(dialOut({ width: 0 })).toThrow(
      'videoSettings.width must be a positive integer'
    );
    expect(dialOut({ height: 721 })).toThrow(
      'videoSettings.height must be less than or equal to 720'
    );
    expect(dialOut({ fps: 1.5 })).toThrow(
      'videoSettings.fps must be a positive integer'
    );
    expect(dialOut({ videoBitrate: 1001 })).toThrow(
      'videoSettings.videoBitrate must be less than or equal to 1000 kbps'
    );
  });

  it('prefixes errors for the caller', () => {
    expect(() =>
      validateSipVideoSettingsFunc({}, false, 'Error starting dial in')
    ).toThrow(
      'Error starting dial in: videoSettings provided but video is not enabled'
    );
  });

  it.each([
    [{ preset: 'sip-active' }],
    [
      {
        preset: 'sip-active',
        maxCamStreams: 4,
        participants: { video: ['owners', '*'], audio: ['*'] },
      },
    ],
    [
      {
        preset: 'sip-grid',
        maxCamStreams: 1,
        participants: { video: ['caller', '*'] },
      },
    ],
    [
      {
        preset: 'sip-portrait',
        variant: 'inset',
        maxCamStreams: 2,
        mainParticipant: 'patient',
        insetParticipant: 'doctor',
      },
    ],
    [
      {
        preset: 'sip-portrait',
        variant: 'inset',
        mainParticipant: 'patient',
        maxCamStreams: 1,
      },
    ],
    [{ preset: 'sip-single', videoParticipant: 'a' }],
    [{ preset: 'sip-single', videoParticipant: 'a', audioParticipant: 'b' }],
  ])('accepts layout %j', (layout) => {
    expect(dialOut({ layout })).not.toThrow();
  });

  it.each([
    ['x', 'videoSettings.layout must be an object'],
    [
      { preset: 'active-participant' },
      'videoSettings.layout.preset must be one of sip-active, sip-grid, sip-single, sip-portrait',
    ],
    [
      { preset: 'constructor' },
      'videoSettings.layout.preset must be one of sip-active, sip-grid, sip-single, sip-portrait',
    ],
    [
      { preset: 'sip-grid', maxCamStreams: 5 },
      'videoSettings.layout.maxCamStreams must be an integer between 1 and 4',
    ],
    [
      { preset: 'sip-portrait', maxCamStreams: 3 },
      'videoSettings.layout.maxCamStreams must be an integer between 1 and 2',
    ],
    [
      { preset: 'sip-single', videoParticipant: 'a', maxCamStreams: 1 },
      'videoSettings.layout.maxCamStreams is not allowed with preset sip-single',
    ],
    [
      { preset: 'sip-grid', variant: 'inset' },
      'videoSettings.layout.variant is not allowed with preset sip-grid',
    ],
    [
      { preset: 'sip-portrait', variant: 'pip' },
      "videoSettings.layout.variant must be 'vertical' or 'inset'",
    ],
    [
      { preset: 'sip-single' },
      'videoSettings.layout.videoParticipant must be a participant user id or session id',
    ],
    [
      { preset: 'sip-single', videoParticipant: '' },
      'videoSettings.layout.videoParticipant must be a participant user id or session id',
    ],
    [
      { preset: 'sip-single', videoParticipant: 'a', audioParticipant: 7 },
      'videoSettings.layout.audioParticipant must be a participant user id or session id',
    ],
    [
      { preset: 'sip-grid', videoParticipant: 'a' },
      'videoSettings.layout.videoParticipant is not allowed with preset sip-grid',
    ],
    [
      { preset: 'sip-single', videoParticipant: 'a', participants: {} },
      'videoSettings.layout.participants is not allowed with preset sip-single',
    ],
    [
      { preset: 'sip-portrait', mainParticipant: 'a' },
      "videoSettings.layout.mainParticipant is only allowed with variant 'inset'",
    ],
    [
      { preset: 'sip-portrait', variant: 'vertical', insetParticipant: 'a' },
      "videoSettings.layout.insetParticipant is only allowed with variant 'inset'",
    ],
    [
      { preset: 'sip-grid', insetParticipant: 'a' },
      'videoSettings.layout.insetParticipant is not allowed with preset sip-grid',
    ],
    [
      { preset: 'sip-portrait', variant: 'inset', mainParticipant: '' },
      'videoSettings.layout.mainParticipant must be a participant user id or session id',
    ],
    [
      {
        preset: 'sip-portrait',
        variant: 'inset',
        mainParticipant: 'a',
        insetParticipant: 'a',
      },
      'videoSettings.layout.insetParticipant must differ from mainParticipant',
    ],
    [
      {
        preset: 'sip-portrait',
        variant: 'inset',
        insetParticipant: 'a',
        maxCamStreams: 1,
      },
      'videoSettings.layout.insetParticipant needs maxCamStreams 2',
    ],
    [
      { preset: 'sip-grid', participants: { video: [] } },
      'videoSettings.layout.participants.video must be a non-empty array of unique strings',
    ],
    [
      { preset: 'sip-grid', participants: { audio: ['*', '*'] } },
      'videoSettings.layout.participants.audio must be a non-empty array of unique strings',
    ],
    [
      {
        preset: 'sip-grid',
        participants: { video: Array.from({ length: 51 }, (_, i) => `p${i}`) },
      },
      'videoSettings.layout.participants.video must have at most 50 entries',
    ],
    [
      { preset: 'sip-grid', participants: { screen: ['*'] } },
      'videoSettings.layout.participants.screen is not allowed',
    ],
    [
      { preset: 'sip-grid', nope: 1 },
      'videoSettings.layout.nope is not allowed with preset sip-grid',
    ],
  ])('rejects layout %j', (layout, message) => {
    expect(dialOut({ layout })).toThrow(`Error starting dial out: ${message}`);
  });
});
