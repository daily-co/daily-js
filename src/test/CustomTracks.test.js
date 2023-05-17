// We need to mock the MediaStreamTrack claas and the mediaDevices which are provided by the browser
class MockMediaStreamTrack {}
global.MediaStreamTrack = MockMediaStreamTrack;
global.navigator.mediaDevices = { enumerateDevices: async () => [] };
global.__dailyJsVersion__ = '*';

import DailyIframe from '../module';

describe('Custom tracks', () => {
  let callObject;

  beforeEach(() => {
    callObject = DailyIframe.createCallObject();
  });

  afterEach(() => {
    callObject.destroy();
  });

  test('Track name must not have more than 50 characters', () => {
    const track = new MediaStreamTrack();
    const trackName = '51_characters_string_000000000000000000000000000000';
    const mode = undefined;
    expect(() =>
      callObject.validateCustomTrack(track, mode, trackName)
    ).toThrowError(
      'Custom track `trackName` must not be more than 50 characters'
    );
  });

  test('Any track name up to 50 characters which does not match a track name already used by daily must be valid', () => {
    const track = new MediaStreamTrack();
    const trackName = '50_characters_string_00000000000000000000000000000';
    const mode = undefined;
    expect(() =>
      callObject.validateCustomTrack(track, mode, trackName)
    ).not.toThrowError();
  });

  test('Track name must not match a track name already used by daily', () => {
    const track = new MediaStreamTrack();
    const reservedNames = [
      'cam-audio',
      'cam-video',
      'screen-video',
      'screen-audio',
      'rmpAudio',
      'rmpVideo',
    ];
    const mode = undefined;
    const expectedError =
      'Custom track `trackName` must not match a track name already used by daily: cam-audio, cam-video, customVideoDefaults, screen-video, screen-audio, rmpAudio, rmpVideo';
    reservedNames.forEach((trackName) => {
      expect(() =>
        callObject.validateCustomTrack(track, mode, trackName)
      ).toThrowError(expectedError);
    });
  });

  test('Track must be a MediaStreamTrack', () => {
    const track = 'Track wrong type';
    const trackName = 'fake track';
    const mode = undefined;
    expect(() =>
      callObject.validateCustomTrack(track, mode, trackName)
    ).toThrowError(
      'Custom tracks provided must be instances of MediaStreamTrack'
    );
  });

  test('Mode must be must be either `music` | `speech` | `DailyMicAudioModeSettings` or `undefined`', () => {
    const track = new MediaStreamTrack();
    const trackName = 'test mode';
    expect(() =>
      callObject.validateCustomTrack(track, undefined, trackName)
    ).not.toThrowError();
    expect(() =>
      callObject.validateCustomTrack(track, 'music', trackName)
    ).not.toThrowError();
    expect(() =>
      callObject.validateCustomTrack(track, 'speech', trackName)
    ).not.toThrowError();
    expect(() =>
      callObject.validateCustomTrack(track, { bitrate: 1000 }, trackName)
    ).not.toThrowError();
    expect(() =>
      callObject.validateCustomTrack(track, 'invalid', trackName)
    ).toThrowError(
      'Custom track `mode` must be either `music` | `speech` | `DailyMicAudioModeSettings` or `undefined`'
    );
  });

  test('startCustomTrack is only allowed when joined', () => {
    const track = new MediaStreamTrack();
    const trackName = 'fake track';
    const mode = undefined;
    expect(() =>
      callObject.startCustomTrack({ track, trackName })
    ).toThrowError('startCustomTrack() is only allowed when joined');
  });
});
