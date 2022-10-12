import { dequal } from 'dequal';
import { MAX_SESSION_DATA_SIZE } from './CommonIncludes';

export const REPLACE_STRATEGY = 'replace';
export const SHALLOW_MERGE_STRATEGY = 'shallow-merge';
export const MERGE_STRATEGIES = [REPLACE_STRATEGY, SHALLOW_MERGE_STRATEGY];

// Explanation of public meeting-session-data-related classes:
// - Client side (this file):
//   - SessionDataUpdate: used on the client side to validate & encapsulate
//     user-specified updates to meeting session data.
//   - SessionDataClientUpdateQueue: used on the client side to enqueue multiple
//     user-specified updates before flushing them to the server as a single
//     payload.
// - Server side (other file, skyliner-express/app/SessionDataServerStore.js):
//   - SessionDataServerStore: used on the SFU side to interact with stored
//     meeting session data, including updating the data and listening to
//     changes to that data (which may have been updated via a different SFU).

// Check whether data is a Plain Old JavaScript Object (a map-like object),
// which can be shallow-merged with another.
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
// CONSIDER THIS "PRIVATE": ONLY MEANT FOR USE BY SESSIONDATACLIENTUPDATEQUEUE
// AND SESSIONDATASERVERSTORE.
export class SessionData {
  constructor() {
    this.data = {};
  }

  // Updates the meeting session data with the given SessionDataUpdate, WITHOUT
  // deleting keys for undefined fields during a 'shallow-merge'`.
  // Assumes sessionDataUpdate is valid.
  update(sessionDataUpdate) {
    if (sessionDataUpdate.isNoOp()) {
      return;
    }
    switch (sessionDataUpdate.mergeStrategy) {
      case SHALLOW_MERGE_STRATEGY:
        this.data = { ...this.data, ...sessionDataUpdate.data };
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

  // Whether the current data exceeds the max size.
  exceedsMaxSize() {
    return JSON.stringify(this.data).length > MAX_SESSION_DATA_SIZE;
  }
}

// An update to meeting session data.
// Guaranteed to be valid upon construction, which means:
// - mergeStrategy is either 'replace' or 'shallow-merge'
// - data is a plain (map-like) object
// - data isn't too big
export class SessionDataUpdate {
  constructor({ data, mergeStrategy = REPLACE_STRATEGY } = {}) {
    SessionDataUpdate._validateMergeStrategy(mergeStrategy);
    SessionDataUpdate._validateData(data, mergeStrategy);
    this.mergeStrategy = mergeStrategy;
    this.data = data;
  }

  // Whether this update is a no-op.
  isNoOp() {
    return SessionDataUpdate.isNoOpUpdate(this.data, this.mergeStrategy);
  }

  // Whether an update comprised of the given data and mergeStrategy would be a
  // no-op.
  static isNoOpUpdate(data, mergeStrategy) {
    return (
      Object.keys(data).length === 0 && mergeStrategy === SHALLOW_MERGE_STRATEGY
    );
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
    // Data must be a plain (map-like) object.
    if (!isPlainOldJavaScriptObject(data)) {
      throw Error(`Meeting session data must be a plain (map-like) object`);
    }

    // Check that what goes in will be the same coming out :)
    // (Make an exception for top-level 'undefined's with 'shallow-merge',
    // though, since those are meaningful and will be translated into key
    // deletions).
    let dataStr;
    try {
      dataStr = JSON.stringify(data);
      if (mergeStrategy === REPLACE_STRATEGY) {
        const out = JSON.parse(dataStr);
        if (!dequal(out, data)) {
          console.warn(
            `The meeting session data provided will be modified when serialized.`,
            out,
            data
          );
        }
      } else if (mergeStrategy === SHALLOW_MERGE_STRATEGY) {
        for (const key in data) {
          if (Object.hasOwnProperty.call(data, key)) {
            if (data[key] !== undefined) {
              const out = JSON.parse(JSON.stringify(data[key]));
              if (!dequal(data[key], out)) {
                console.warn(
                  `At least one key in the meeting session data provided will be modified when serialized.`,
                  out,
                  data[key]
                );
              }
            }
          }
        }
      }
    } catch (e) {
      throw Error(`Meeting session data must be serializable to JSON: ${e}`);
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
    // If update is a no-op, don't enqueue it.
    if (sessionDataUpdate.isNoOp()) {
      return;
    }

    // If "queue" is empty, initialize it.
    if (!this.sessionData) {
      this.sessionData = new SessionData();
      this.mergeStrategyForNextServerUpdate = sessionDataUpdate.mergeStrategy;
    }

    // Update data in the "queue".
    this.sessionData.update(sessionDataUpdate);

    // If this was a 'replace' update, set 'replace' as the strategy for the
    // next server update, regardless of incoming client updates until then.
    if (sessionDataUpdate.mergeStrategy === REPLACE_STRATEGY) {
      this.mergeStrategyForNextServerUpdate = REPLACE_STRATEGY;
    }
  }

  // Flush queue into an update payload to send to the server.
  // Returns null if there's no update to send, or it'd be a no-op.
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

    // If this is a merge and any top-level keys are undefined, translate them
    // into explicit "keys to delete" in the payload; otherwise they'd be
    // stripped during JSON serialization.
    if (payload.mergeStrategy === SHALLOW_MERGE_STRATEGY) {
      for (const key in payload.data) {
        if (Object.hasOwnProperty.call(payload.data, key)) {
          if (payload.data[key] === undefined) {
            if (!payload.keysToDelete) {
              payload.keysToDelete = [];
            }
            payload.keysToDelete.push(key);
            delete payload.data[key];
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
