import Daily from '../module';

describe('Custom tracks', () => {
  let callObject;

  beforeEach(() => {
    callObject = Daily.createCallObject();
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
    ).toThrow('Custom track `trackName` must not be more than 50 characters');
  });

  test('Any track name up to 50 characters which does not match a track name already used by daily must be valid', () => {
    const track = new MediaStreamTrack();
    const trackName = '50_characters_string_00000000000000000000000000000';
    const mode = undefined;
    expect(() =>
      callObject.validateCustomTrack(track, mode, trackName)
    ).not.toThrow();
  });

  test('Track name must not match a track name already used by daily', () => {
    const track = new MediaStreamTrack();
    const reservedNames = [
      'audio',
      'video',
      'cam-audio',
      'cam-video',
      'screenVideo',
      'screenAudio',
      'screen-video',
      'screen-audio',
      'rmpAudio',
      'rmpVideo',
      'customVideoDefaults',
    ];
    const mode = undefined;
    const expectedError =
      'Custom track `trackName` must not match a track name already used by daily: audio, video, cam-audio, cam-video, screenVideo, screenAudio, screen-video, screen-audio, rmpAudio, rmpVideo, customVideoDefaults';
    reservedNames.forEach((trackName) => {
      expect(() =>
        callObject.validateCustomTrack(track, mode, trackName)
      ).toThrow(expectedError);
    });
  });

  test('Track must be a MediaStreamTrack', () => {
    const track = 'Track wrong type';
    const trackName = 'fake track';
    const mode = undefined;
    expect(() =>
      callObject.validateCustomTrack(track, mode, trackName)
    ).toThrow('Custom tracks provided must be instances of MediaStreamTrack');
  });

  test('Mode must be must be either `music` | `speech` | `DailyMicAudioModeSettings` or `undefined`', () => {
    const track = new MediaStreamTrack();
    const trackName = 'test mode';
    expect(() =>
      callObject.validateCustomTrack(track, undefined, trackName)
    ).not.toThrow();
    expect(() =>
      callObject.validateCustomTrack(track, 'music', trackName)
    ).not.toThrow();
    expect(() =>
      callObject.validateCustomTrack(track, 'speech', trackName)
    ).not.toThrow();
    expect(() =>
      callObject.validateCustomTrack(track, { bitrate: 1000 }, trackName)
    ).not.toThrow();
    expect(() =>
      callObject.validateCustomTrack(track, 'invalid', trackName)
    ).toThrow(
      'Custom track `mode` must be either `music` | `speech` | `DailyMicAudioModeSettings` or `undefined`'
    );
  });

  test('startCustomTrack is only allowed when joined', () => {
    const track = new MediaStreamTrack();
    const trackName = 'fake track';
    expect(() => callObject.startCustomTrack({ track, trackName })).toThrow(
      'startCustomTrack() only supported after join.'
    );
  });
});
