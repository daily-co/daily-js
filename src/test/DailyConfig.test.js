class MockMediaStreamTrack {}
global.navigator.mediaDevices = { enumerateDevices: async () => [] };
global.__dailyJsVersion__ = '*';

import DailyIframe from '../module';

describe('DailyConfig', () => {
  let callObject;

  beforeEach(() => {
    callObject = DailyIframe.createCallObject();
  });

  afterEach(() => {
    callObject.destroy();
  });

  test('Not throw error with empty config', () => {
    const dailyConfig = {};
    expect(() => callObject.validateDailyConfig(dailyConfig)).not.toThrow();
  });

  test('Not throw error with valid config', () => {
    const CAM_ENCODINGS = [
      { maxBitrate: 90000, scaleResolutionDownBy: 4, maxFramerate: 15 },
      { maxBitrate: 200000, scaleResolutionDownBy: 3, maxFramerate: 15 },
      { maxBitrate: 400000, scaleResolutionDownBy: 2, maxFramerate: 30 },
    ];
    const dailyConfig = {
      camSimulcastEncodings: CAM_ENCODINGS,
    };
    expect(() => callObject.validateDailyConfig(dailyConfig)).not.toThrow();
  });

  test('Throw error with an empty array', () => {
    const CAM_ENCODINGS = [];
    const dailyConfig = {
      camSimulcastEncodings: CAM_ENCODINGS,
    };
    expect(() => callObject.validateDailyConfig(dailyConfig)).toThrowError(
      'encodings must be an Array with between 1 to 3 layers'
    );
  });

  test('Throw error with invalid key', () => {
    const CAM_ENCODINGS = [
      { invalidKey: 90000, scaleResolutionDownBy: 4, maxFramerate: 15 },
    ];
    const dailyConfig = {
      camSimulcastEncodings: CAM_ENCODINGS,
    };
    expect(() => callObject.validateDailyConfig(dailyConfig)).toThrowError(
      'Invalid key invalidKey, valid keys are:maxBitrate,maxFramerate,scaleResolutionDownBy'
    );
  });

  test('Throw error with invalid value', () => {
    const CAM_ENCODINGS = [
      { maxBitrate: 'notNumber', scaleResolutionDownBy: 4, maxFramerate: 15 },
    ];
    const dailyConfig = {
      camSimulcastEncodings: CAM_ENCODINGS,
    };
    expect(() => callObject.validateDailyConfig(dailyConfig)).toThrowError(
      'maxBitrate must be a number'
    );
  });

  test('Throw error if an empty object is used as one of the encodings', () => {
    const CAM_ENCODINGS = [
      { maxBitrate: 900, scaleResolutionDownBy: 4, maxFramerate: 15 },
      {},
      {},
    ];
    const dailyConfig = {
      camSimulcastEncodings: CAM_ENCODINGS,
    };
    expect(() => callObject.validateDailyConfig(dailyConfig)).toThrowError(
      'Empty encoding is not allowed. At least one of these valid keys should be specified:maxBitrate,maxFramerate,scaleResolutionDownBy'
    );
  });
});
