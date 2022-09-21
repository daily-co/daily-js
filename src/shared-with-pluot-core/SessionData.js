import { dequal } from 'dequal';
import { MAX_SESSION_DATA_SIZE } from './CommonIncludes';

export const REPLACE_STRATEGY = 'replace';
export const SHALLOW_MERGE_STRATEGY = 'shallow-merge';
export const MERGE_STRATEGIES = [REPLACE_STRATEGY, SHALLOW_MERGE_STRATEGY];

// Check whether data is a Plain Old JavaScript Object, which can be shallow-
// merged with another.
// From https://masteringjs.io/tutorials/fundamentals/pojo.
function isPlainOldJavaScriptObject(data) {
  if (data == null || typeof data !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(data);
  if (proto == null) {
    return true;
  }
  return proto === Object.prototype;
}

// Meeting session data.
// ONLY FOR USE BY OTHER CLASSES IN THIS FILE. EXTERNAL CODE SHOULD USE:
// - SessionDataUpdate to validate & encapsulate user-provided updates
// - SessionDataClientUpdateQueue to debounce those updates before sending them
//   to the server
// - SessionDataServerStore to maintain session data on the server
class SessionData {
  constructor(data) {
    this.data = data;
  }

  // Updates the meeting session data with the given SessionDataUpdate, WITHOUT
  // deleting keys for undefined fields during a 'shallow-merge'`.
  // Assumes sessionDataUpdate is valid.
  update(sessionDataUpdate) {
    // If data was previously undefined, even a shallow merge replaces it.
    if (this.data === undefined) {
      this.data = sessionDataUpdate.data;
      return;
    }

    switch (sessionDataUpdate.mergeStrategy) {
      case SHALLOW_MERGE_STRATEGY:
        if (
          isPlainOldJavaScriptObject(sessionDataUpdate.data) &&
          isPlainOldJavaScriptObject(this.data)
        ) {
          this.data = { ...this.data, ...sessionDataUpdate.data };
        }
        break;
      case REPLACE_STRATEGY:
        this.data = sessionDataUpdate.data;
        break;
    }
  }

  // Deletes the specified keys from the meeting session data.
  deleteKeys(keys) {
    if (Array.isArray(keys)) {
      for (const key of keys) {
        if (isPlainOldJavaScriptObject(this.data)) {
          delete this.data[key];
        }
      }
    }
  }
}

export const UNIT_TEST_EXPORTS = { SessionData };

// A user-specified update to meeting session data.
export class SessionDataUpdate {
  constructor({ data, mergeStrategy = REPLACE_STRATEGY } = {}) {
    SessionDataUpdate._validateMergeStrategy(mergeStrategy);
    SessionDataUpdate._validateData(data, mergeStrategy);
    this.mergeStrategy = mergeStrategy;
    this.data = data;
  }

  // Validate merge strategy, throwing an error if invalid.
  // Assumes mergeStrategy is not undefined.
  static _validateMergeStrategy(mergeStrategy) {
    if (!MERGE_STRATEGIES.includes(mergeStrategy)) {
      throw Error(
        `Unrecognized mergeStrategy provided. Options are: [${MERGE_STRATEGIES}]`
      );
    }
  }

  // Validate data with the given merge strategy, throwing an error if invalid.
  // Assumes mergeStrategy is valid.
  static _validateData(data, mergeStrategy) {
    // Null or undefined data is always valid
    // (Though note that they are no-ops when mergeStrategy is 'shallow-merge')
    if (data === undefined || data === null) {
      return;
    }

    // If mergeStrategy is 'shallow-merge', non-null/undefined data must be a
    // plain (map-like) object
    if (mergeStrategy === SHALLOW_MERGE_STRATEGY) {
      if (!isPlainOldJavaScriptObject(data)) {
        throw Error(
          `When mergeStrategy is 'shallow-merge', meeting session data must be a plain (map-like) object`
        );
      }
    }

    let dataStr;
    if (typeof data === 'string') {
      // JSON.stringify adds two characters to the string (""), so do sizing
      // checks on the raw string.
      dataStr = data;
    } else {
      try {
        dataStr = JSON.stringify(data);
        // Check that what goes in is the same coming out :)
        // TODO: ignore undefineds at the top level when 'shallow-merge'
        const out = JSON.parse(dataStr);
        if (!dequal(out, data)) {
          console.warn(
            `The meeting session data provided will be modified when serialized.`,
            out,
            data
          );
        }
      } catch (e) {
        throw Error(`Meeting session data must be serializable to JSON: ${e}`);
      }
    }

    // Check the size of the payload
    if (dataStr.length > MAX_SESSION_DATA_SIZE) {
      throw Error(
        `Meeting session data is too large (${dataStr.length} characters). Maximum size suppported is ${MAX_SESSION_DATA_SIZE}.`
      );
    }
  }
}

// The client-side update "queue" where meeting session data updates temporarily
// live before getting flushed to the server (necessary thanks to client-side
// debouncing).
// Note that "queue" is in quotes because, though it behaves like a queue, in
// its implementation the updates are actually merged in place into a single
// server update.
export class SessionDataClientUpdateQueue {
  constructor() {
    this._resetQueue();
  }

  // "Enqueues" a SessionDataUpdate.
  // Assumes sessionDataUpdate is valid.
  enqueueUpdate(sessionDataUpdate) {
    // If "queue" is empty, initialize it.
    if (!this.sessionData) {
      this.sessionData = new SessionData(sessionDataUpdate.data);
      this.mergeStrategyForNextServerUpdate = sessionDataUpdate.mergeStrategy;
      return;
    }

    // Otherwise, update data in the "queue".
    this.sessionData.update(sessionDataUpdate);

    // If this was a 'replace' update, set 'replace' as the strategy for the
    // next server update, regardless of incoming client updates until then.
    if (sessionDataUpdate.mergeStrategy === REPLACE_STRATEGY) {
      this.mergeStrategyForNextServerUpdate = REPLACE_STRATEGY;
    }
  }

  // Flush queue into an update payload to send to the server.
  flushToServerUpdatePayload() {
    // If nothing's enqueued, return no payload.
    if (!this.sessionData) {
      return null;
    }

    // Make server payload.
    let payload = {
      data: this.sessionData.data,
      mergeStrategy: this.mergeStrategyForNextServerUpdate,
    };

    // If this is a merge and any top-level keys are undefined, include them in
    // the server payload as "to be removed", since they'd otherwise be stripped
    // during JSON serialization.
    if (payload.mergeStrategy === SHALLOW_MERGE_STRATEGY) {
      for (const key in payload.data) {
        if (Object.hasOwnProperty.call(payload.data, key)) {
          if (payload.data[key] === undefined) {
            if (!payload.keysToDelete) {
              payload.keysToDelete = [];
            }
            payload.keysToDelete.push(key);
          }
        }
      }
    }

    this._resetQueue();

    return payload;
  }

  _resetQueue() {
    this.sessionData = null;
    this.mergeStrategyForNextServerUpdate = false;
  }
}

// The server-side store for meeting session data.
export class SessionDataServerStore {
  constructor() {
    this.sessionData = new SessionData();
  }

  // Update session data from the payload of a client message.
  // Throws if clientPayload doesn't contain a valid session data update.
  updateFromClient(clientPayload) {
    // Update session data, without deleting keys.
    const sessionDataUpdate = new SessionDataUpdate({
      data: clientPayload.data,
      mergeStrategy: clientPayload.mergeStrategy,
    });
    this.sessionData.update(sessionDataUpdate);

    // Handle any keys that need to be deleted.
    this.sessionData.deleteKeys(clientPayload.keysToDelete);
  }

  // Update session data from the payload of a peer SFU message.
  updateFromPeerServer(peerServerPayload) {
    // TODO
  }
}
