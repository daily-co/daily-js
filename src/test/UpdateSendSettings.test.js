// We need to mock the MediaStreamTrack class and the mediaDevices which are provided by the browser
import {
  DEFAULT_VIDEO_SEND_SETTINGS_PRESET_KEY,
  HIGH_BANDWIDTH_VIDEO_SEND_SETTINGS_PRESET_KEY,
  LOW_BANDWIDTH_VIDEO_SEND_SETTINGS_PRESET_KEY,
  MEDIUM_BANDWIDTH_VIDEO_SEND_SETTINGS_PRESET_KEY,
} from '../shared-with-pluot-core/CommonIncludes';

class MockMediaStreamTrack {}
global.navigator.mediaDevices = { enumerateDevices: async () => [] };
global.__dailyJsVersion__ = '*';

import DailyIframe from '../module';

describe('UpdateSendSettings', () => {
  let callObject;

  beforeEach(() => {
    callObject = DailyIframe.createCallObject();
  });

  afterEach(() => {
    callObject.destroy();
  });

  test('updateSendSettings object must not be null or empty', () => {
    let updateSendSettings = null;
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).toThrowError(
      'Send settings must contain at least information for one track!'
    );
    updateSendSettings = {};
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).toThrowError(
      'Send settings must contain at least information for one track!'
    );
  });

  test('DailyVideoSendSettings object must not be empty', () => {
    let updateSendSettings = { video: {} };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).toThrowError(
      'Video send settings must contain at least maxQuality or encodings attribute'
    );
  });

  test('DailyVideoSendSettingsPreset must contain only the allowed values', () => {
    let updateSendSettings = {
      video: 'fakePreset',
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).toThrowError(
      'Video send settings should be either an object or one of the supported presets: default-video,bandwidth-optimized,bandwidth-and-quality-balanced,quality-optimized'
    );
    updateSendSettings = {
      video: DEFAULT_VIDEO_SEND_SETTINGS_PRESET_KEY,
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).not.toThrow();
    updateSendSettings = {
      video: LOW_BANDWIDTH_VIDEO_SEND_SETTINGS_PRESET_KEY,
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).not.toThrow();
    updateSendSettings = {
      video: MEDIUM_BANDWIDTH_VIDEO_SEND_SETTINGS_PRESET_KEY,
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).not.toThrow();
    updateSendSettings = {
      video: HIGH_BANDWIDTH_VIDEO_SEND_SETTINGS_PRESET_KEY,
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).not.toThrow();
  });

  test('DailyVideoSendSettings must be an object or preset', () => {
    let updateSendSettings = {
      video: 22,
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).toThrowError(
      'Video send settings should be either an object or one of the supported presets: default-video,bandwidth-optimized,bandwidth-and-quality-balanced,quality-optimized'
    );
  });

  test('DailyVideoSendSettings maxQuality', () => {
    let updateSendSettings = {
      video: {
        maxQuality: 'invalid',
      },
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).toThrowError('maxQuality must be either low, medium or high');
    updateSendSettings = {
      video: {
        maxQuality: 'low',
      },
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).not.toThrow();
    updateSendSettings = {
      video: {
        maxQuality: 'medium',
      },
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).not.toThrow();
    updateSendSettings = {
      video: {
        maxQuality: 'high',
      },
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).not.toThrow();
  });

  test('DailyVideoSendSettings encodings must be defined as: low, low and medium, or low, medium and high.', () => {
    let updateSendSettings = {
      video: {
        encodings: {},
      },
    };
    const expectedEncodingErrorMsg =
      'Encodings must be defined as: low, low and medium, or low, medium and high.';
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).toThrowError(expectedEncodingErrorMsg);
    updateSendSettings = {
      video: {
        encodings: {
          medium: {
            maxBitrate: 90000,
            scaleResolutionDownBy: 4,
            maxFramerate: 15,
          },
        },
      },
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).toThrowError(expectedEncodingErrorMsg);
    updateSendSettings = {
      video: {
        encodings: {
          medium: {
            maxBitrate: 90000,
            scaleResolutionDownBy: 2,
            maxFramerate: 15,
          },
          high: {
            maxBitrate: 200000,
            scaleResolutionDownBy: 1,
            maxFramerate: 30,
          },
        },
      },
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).toThrowError(expectedEncodingErrorMsg);
    updateSendSettings = {
      video: {
        encodings: {
          low: {
            maxBitrate: 90000,
            scaleResolutionDownBy: 4,
            maxFramerate: 15,
          },
          medium: {
            maxBitrate: 200000,
            scaleResolutionDownBy: 2,
            maxFramerate: 15,
          },
          high: {
            maxBitrate: 680000,
            scaleResolutionDownBy: 1,
            maxFramerate: 30,
          },
        },
      },
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).not.toThrow();
  });

  test('DailyVideoSendSettings encodings must not have an empty object as one of the encodings', () => {
    let updateSendSettings = {
      video: {
        encodings: {
          low: {},
        },
      },
    };
    const expectedEncodingErrorMsg =
      'Empty encoding is not allowed. At least one of these valid keys should be specified:maxBitrate,maxFramerate,scaleResolutionDownBy';
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).toThrowError(expectedEncodingErrorMsg);
    updateSendSettings = {
      video: {
        encodings: {
          low: {
            maxBitrate: 90000,
            scaleResolutionDownBy: 4,
            maxFramerate: 15,
          },
          medium: {},
        },
      },
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).toThrowError(expectedEncodingErrorMsg);
    updateSendSettings = {
      video: {
        encodings: {
          low: {
            maxBitrate: 90000,
            scaleResolutionDownBy: 4,
            maxFramerate: 15,
          },
          medium: {
            maxBitrate: 200000,
            scaleResolutionDownBy: 2,
            maxFramerate: 15,
          },
          high: {},
        },
      },
    };
    expect(() =>
      callObject.validateUpdateSendSettings(updateSendSettings)
    ).toThrowError(expectedEncodingErrorMsg);
  });
});
