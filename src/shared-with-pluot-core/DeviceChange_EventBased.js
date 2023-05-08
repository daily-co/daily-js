let deviceChangeListeners = new Map();
let systemListener = null;

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

    // Create the single "system listener" that the system/browser will
    // invoke when it detects a device change.
    // The system listener will be responsible for iterating through all the
    // listeners and invoking them with the latest devices.
    // and pass the devices to all the listeners
    if (systemListener) {
      return;
    }
    systemListener = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();

      for (const listener of deviceChangeListeners.keys()) {
        // If devices have changed since the listener was last invoked, run it
        const devicesString = JSON.stringify(devices);
        if (
          devicesString !==
          deviceChangeListeners.get(listener).lastDevicesString
        ) {
          deviceChangeListeners.get(listener).lastDevicesString = devicesString;
          listener(devices);
        }
      }
    };

    // Register our "system listener" as the browser/system event listener
    navigator.mediaDevices.addEventListener('devicechange', systemListener);
  });
}

export function removeDeviceChangeListener(deviceChangeListener) {
  // If the given listener hasn't ever been added, skip
  if (!deviceChangeListeners.has(deviceChangeListener)) {
    return;
  }

  // Remove the `deviceChangeListeners` entry for the listener
  deviceChangeListeners.delete(deviceChangeListener);

  // If there are no more listeners, unregister our "system listener" as the
  // browser/system event listener.
  // (First check if the listener was ever created, since we may be removing
  // this listener before then)
  if (deviceChangeListeners.size === 0 && systemListener) {
    navigator.mediaDevices.removeEventListener('devicechange', systemListener);
    systemListener = null;
  }
}
