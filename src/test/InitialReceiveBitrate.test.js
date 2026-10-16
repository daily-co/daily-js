import Daily from '../module';

describe('receiveSettings.initialReceiveBitrate', () => {
  let callObject;

  beforeEach(() => {
    callObject = Daily.createCallObject();
  });

  afterEach(async () => {
    await callObject.destroy();
  });

  const validate = (receiveSettings) =>
    callObject.validateProperties({ receiveSettings });

  test('initialReceiveBitrate is accepted', () => {
    expect(() => validate({ initialReceiveBitrate: 2500000 })).not.toThrow();
  });

  test('it is accepted next to participant receive settings', () => {
    expect(() =>
      validate({
        initialReceiveBitrate: 2500000,
        base: { video: { layer: 0 } },
      })
    ).not.toThrow();
  });

  test('the range limits are accepted', () => {
    expect(() => validate({ initialReceiveBitrate: 30000 })).not.toThrow();
    expect(() => validate({ initialReceiveBitrate: 4294967295 })).not.toThrow();
  });

  test('initialReceiveBitrate must be a whole number in the range the SFU accepts', () => {
    for (const invalidValue of [29999, 4294967296, 1500000.5, '2500000', -1]) {
      expect(() => validate({ initialReceiveBitrate: invalidValue })).toThrow(
        'initialReceiveBitrate must be a whole number of bits per second, between 30000 and 4294967295'
      );
    }
  });

  test('participant receive settings are still validated', () => {
    expect(() =>
      validate({
        initialReceiveBitrate: 2500000,
        base: { video: { layer: -1 } },
      })
    ).toThrow("property 'receiveSettings'");
  });

  test('it is passed to the call machine but not returned by getReceiveSettings()', async () => {
    await callObject.destroy();
    callObject = Daily.createCallObject({
      receiveSettings: {
        initialReceiveBitrate: 2500000,
        base: { video: { layer: 0 } },
      },
    });
    expect(callObject.properties.receiveSettings).toEqual({
      initialReceiveBitrate: 2500000,
      base: { video: { layer: 0 } },
    });
    expect(await callObject.getReceiveSettings()).toEqual({
      base: { video: { layer: 0 } },
    });
  });

  test('it is rejected by updateReceiveSettings()', async () => {
    await expect(
      callObject.updateReceiveSettings({ initialReceiveBitrate: 2500000 })
    ).rejects.toThrow(
      'initialReceiveBitrate can only be set in the receiveSettings config property, when joining'
    );
  });
});

describe('receiveSettings.initialReceiveBitrate in prebuilt', () => {
  let callFrame;

  beforeAll(() => {
    callFrame = Daily.createFrame();
  });

  afterAll(() => {
    // Not awaited: the frame's call machine never loads in tests, so leave()
    // (called by destroy()) waits on a response that never arrives. Keep this
    // block last in the file.
    callFrame.destroy();
  });

  test('it is rejected', () => {
    expect(() =>
      callFrame.validateProperties({
        receiveSettings: { initialReceiveBitrate: 2500000 },
      })
    ).toThrow('initialReceiveBitrate is only available in call object mode');
  });
});
