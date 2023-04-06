let deviceChangeListeners = new Map();
let deviceChangePollInterval = null;

const POLL_INTERVAL_MS = 3000;

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

    // Start the poll, if not already started when adding another listener.
    // The poll will be responsible for iterating through all the listeners and
    // invoking them with the latest devices.
    if (deviceChangePollInterval) {
      return;
    }
    deviceChangePollInterval = setInterval(async () => {
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
    }, POLL_INTERVAL_MS);
  });
}

// Assumes entry exists in `deviceChangeListeners`
export function removeDeviceChangeListener(deviceChangeListener) {
  // If the given listener hasn't ever been added, skip
  if (!deviceChangeListeners.has(deviceChangeListener)) {
    return;
  }

  // Remove the `deviceChangeListeners` entry for the listener
  deviceChangeListeners.delete(deviceChangeListener);

  // If there are no more listeners, stop the polling.
  // (First check if the poll interval was ever started, since we may be
  // removing this listener before then)
  if (deviceChangeListeners.size === 0 && deviceChangePollInterval) {
    clearInterval(deviceChangePollInterval);
    deviceChangePollInterval = null;
  }
}
