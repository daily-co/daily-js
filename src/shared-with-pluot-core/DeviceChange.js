import { isReactNative } from './Environment';
import * as EventBased from './DeviceChange_EventBased';
import * as PollBased from './DeviceChange_PollBased';

// Desktop web, iOS web, and React Native support the 'devicechange' event.
// Android Chrome/Samsung Internet doesn't.
const supportsEventBasedDeviceChangeDetection =
  isReactNative() ||
  typeof navigator.mediaDevices.ondevicechange !== 'undefined';
const { addDeviceChangeListener, removeDeviceChangeListener } =
  supportsEventBasedDeviceChangeDetection ? EventBased : PollBased;
export { addDeviceChangeListener, removeDeviceChangeListener };
