let deviceChangeListeners = new Map();

export function addDeviceChangeListener(deviceChangeListener) {
  // If the given listener was already added, skip
  if (deviceChangeListeners.has(deviceChangeListener)) {
    return;
  }

  // Add a `deviceChangeListeners` entry for the listener
  deviceChangeListeners.set(deviceChangeListener, {});

  navigator.mediaDevices.enumerateDevices().then((devices) => {
    // If `deviceChangeListeners` entry has been removed while we were waiting
    // for `enumerateDevices()`, bail
    if (!deviceChangeListeners.has(deviceChangeListener)) {
      return;
    }

    // Store initial devices for diffing later
    deviceChangeListeners.get(deviceChangeListener).lastDevicesString =
      JSON.stringify(devices);

    // Create the "wrapped listener" that will do the `enumerateDevices()` call
    // and pass the devices to the given listener
    const wrappedListener = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();

      // If `deviceChangeListeners` entry has been removed while we were
      // waiting for `enumerateDevices()`, bail
      if (!deviceChangeListeners.has(deviceChangeListener)) {
        return;
      }

      // Only invoke the listener if devices have changed.
      // We need to do this check because the browser 'devicechange' event fires
      // twice back-to-back in the case of an input/output device (i.e. a
      // headset) being plugged in or unplugged.
      const devicesString = JSON.stringify(devices);
      if (
        devicesString !==
        deviceChangeListeners.get(deviceChangeListener).lastDevicesString
      ) {
        deviceChangeListeners.get(deviceChangeListener).lastDevicesString =
          devicesString;
        deviceChangeListener(devices);
      }
    };
    deviceChangeListeners.get(deviceChangeListener).wrappedListener =
      wrappedListener;

    // Add "wrapped listener" as browser/system event listener
    navigator.mediaDevices.addEventListener('devicechange', wrappedListener);
  });
}

export function removeDeviceChangeListener(deviceChangeListener) {
  // If the given listener hasn't ever been added, skip
  if (!deviceChangeListeners.has(deviceChangeListener)) {
    return;
  }

  // Retrieve the "wrapped listener"
  const wrappedListener =
    deviceChangeListeners.get(deviceChangeListener).wrappedListener;

  // Remove the `deviceChangeListeners` entry for the listener
  deviceChangeListeners.delete(deviceChangeListener);

  // Remove "wrapped listener" from browser/system
  // (Check first, since we may be removing a listener before it finished
  // getting added)
  if (wrappedListener) {
    navigator.mediaDevices.removeEventListener('devicechange', wrappedListener);
  }
}
