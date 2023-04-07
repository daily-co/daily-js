import { isReactNative } from './Environment';
import * as EventBased from './DeviceChange_EventBased';
import * as PollBased from './DeviceChange_PollBased';

export function addDeviceChangeListener(deviceChangeListener) {
  _supportsEventBasedDeviceChangeDetection()
    ? EventBased.addDeviceChangeListener(deviceChangeListener)
    : PollBased.addDeviceChangeListener(deviceChangeListener);
}

export function removeDeviceChangeListener(deviceChangeListener) {
  _supportsEventBasedDeviceChangeDetection()
    ? EventBased.removeDeviceChangeListener(deviceChangeListener)
    : PollBased.removeDeviceChangeListener(deviceChangeListener);
}

// Desktop web, iOS web, and React Native support the 'devicechange' event.
// Android Chrome/Samsung Internet doesn't.
function _supportsEventBasedDeviceChangeDetection() {
  return (
    isReactNative() ||
    typeof navigator.mediaDevices.ondevicechange !== 'undefined'
  );
}
