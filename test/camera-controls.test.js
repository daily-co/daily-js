/**
 * @jest-environment jsdom
 */
import DailyIframe from '../src/module';
import * as DailyModule from '../src/module';

function useReactNative(enabled) {
  const api = DailyModule.__RewireAPI__ || DailyIframe.__RewireAPI__;
  if (!api) {
    throw new Error(
      `rewire API missing; module keys: ${Object.keys(DailyModule).join(',')}`
    );
  }
  api.__Rewire__('isReactNative', () => enabled);
}

function callWithNativeUtils(nativeUtils) {
  global.DailyNativeUtils = nativeUtils;
  useReactNative(true);
  return Object.create(DailyIframe.prototype);
}

describe('camera torch and zoom', () => {
  afterEach(() => {
    const api = DailyModule.__RewireAPI__ || DailyIframe.__RewireAPI__;
    if (api) {
      api.__ResetDependency__('isReactNative');
    }
    delete global.DailyNativeUtils;
  });

  test('web callers are rejected', async () => {
    useReactNative(false);
    const call = Object.create(DailyIframe.prototype);
    await expect(call.setCameraTorch(true)).rejects.toThrow(
      'only supported in React Native'
    );
    await expect(call.isCameraTorchAvailable()).rejects.toThrow(
      'only supported in React Native'
    );
    await expect(call.setCameraZoom(2)).rejects.toThrow(
      'only supported in React Native'
    );
    await expect(call.getCameraZoom()).rejects.toThrow(
      'only supported in React Native'
    );
  });

  test('React Native forwards torch and zoom to DailyNativeUtils', async () => {
    const nativeUtils = {
      setCameraTorch: jest.fn(() => Promise.resolve()),
      isCameraTorchAvailable: jest.fn(() => Promise.resolve(true)),
      setCameraZoom: jest.fn(() => Promise.resolve()),
      getCameraZoom: jest.fn(() =>
        Promise.resolve({ ratio: 1, min: 1, max: 4 })
      ),
    };
    const call = callWithNativeUtils(nativeUtils);

    await expect(call.setCameraTorch(true)).resolves.toBeUndefined();
    await expect(call.isCameraTorchAvailable()).resolves.toBe(true);
    await expect(call.setCameraZoom(2)).resolves.toBeUndefined();
    await expect(call.getCameraZoom()).resolves.toEqual({
      ratio: 1,
      min: 1,
      max: 4,
    });

    expect(nativeUtils.setCameraTorch).toHaveBeenCalledWith(true);
    expect(nativeUtils.isCameraTorchAvailable).toHaveBeenCalledWith();
    expect(nativeUtils.setCameraZoom).toHaveBeenCalledWith(2);
    expect(nativeUtils.getCameraZoom).toHaveBeenCalledWith();
  });

  test('native rejections pass through', async () => {
    const call = callWithNativeUtils({
      setCameraTorch: () =>
        Promise.reject(
          new Error('org.jitsi:webrtc:124.+ does not declare torch')
        ),
      setCameraZoom: () =>
        Promise.reject(
          new Error('org.jitsi:webrtc:124.+ does not declare zoom')
        ),
      isCameraTorchAvailable: () => Promise.resolve(false),
      getCameraZoom: () => Promise.resolve(null),
    });

    await expect(call.setCameraTorch(true)).rejects.toThrow(
      'org.jitsi:webrtc:124.+'
    );
    await expect(call.setCameraZoom(2)).rejects.toThrow(
      'does not declare zoom'
    );
    await expect(call.isCameraTorchAvailable()).resolves.toBe(false);
    await expect(call.getCameraZoom()).resolves.toBeNull();
  });
});
