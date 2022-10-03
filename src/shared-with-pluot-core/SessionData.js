import { dequal } from 'dequal';
import { MAX_SESSION_DATA_SIZE } from './CommonIncludes';

export const REPLACE_STRATEGY = 'replace';
export const SHALLOW_MERGE_STRATEGY = 'shallow-merge';
export const MERGE_STRATEGIES = [REPLACE_STRATEGY, SHALLOW_MERGE_STRATEGY];

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
// ONLY FOR USE BY OTHER CLASSES IN THIS FILE. EXTERNAL CODE SHOULD USE:
// - SessionDataUpdate to validate & encapsulate updates to session data.
// - SessionDataClientUpdateQueue to locally enqueue some user-provided updates
//   before flushing them all to the server as one update.
// - SessionDataServerStore to maintain session data on the server.
class SessionData {
  constructor() {
    this.data = {};
  }

  // Updates the meeting session data with the given SessionDataUpdate, WITHOUT
  // deleting keys for undefined fields during a 'shallow-merge'`.
  // Assumes data and sessionDataUpdate are valid.
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
}

export const UNIT_TEST_EXPORTS = { SessionData };

// An update to meeting session data.
// Guaranteed to be valid upon construction, which means:
// - mergeStrategy is either 'replace' or 'shallow-merge'
// - data is either null, undefined, or a plain (map-like) object
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
      data === null ||
      data === undefined ||
      (Object.keys(data).length === 0 &&
        mergeStrategy === SHALLOW_MERGE_STRATEGY)
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
    // Null and undefined data are valid; they are simply no-ops.
    // We're choosing to allow them in order to be user-friendly: variables that
    // users pass in as session data might easily become null or undefined and
    // it doesn't hurt to simply no-op rather than throw, alleviating some
    // validation burden in their code.
    if (data === undefined || data === null) {
      return;
    }

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

    // Otherwise, update data in the "queue".
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

// The server-side store for meeting session data.
// NOTE: this is very temporarily an in-memory store running directly on the
// SFU, which is why the meeting session data API does not support mesh SFU.
// This implementation will soon be updated to use an in-memory store shared
// between SFUs.
export class SessionDataServerStore {
  constructor({ mtgStr, redis, subscriberRedis, logger, dataChangeHandler }) {
    this.redis = redis;
    this.subscriberRedis = subscriberRedis;
    this.logger = logger;
    this.key = `${mtgStr}:session-data`;
    this.keyspacePattern = `__keyspace*__:${this.key}`;
    this.data = null; // not {} to avoid pretending we know when we don't yet
    this.dataChangeHandler = dataChangeHandler;

    this.initialized = false;
    this.subscribed = false;
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    this._subscribeToDataMaybeChangedMessages();
    this.data = this._decodeFromRedis(await this.redis.hgetall(this.key));

    this.initialized = true;
  }

  // Update session data from the payload of a client message.
  // Throws if clientPayload doesn't contain a valid session data update.
  updateFromClient({ data, mergeStrategy, keysToDelete }) {
    // Validation: ensure data and/or keysToDelete (if provided) are of expected
    // types
    if (data && !isPlainOldJavaScriptObject(data)) {
      return;
    }
    if (keysToDelete && !Array.isArray(keysToDelete)) {
      return;
    }

    // Transform data for storage in Redis
    data = this._encodeForRedis(data);

    // Perform update
    if (mergeStrategy === REPLACE_STRATEGY) {
      this._replace(data);
    } else if (mergeStrategy === SHALLOW_MERGE_STRATEGY) {
      this._shallowMerge(data, keysToDelete);
    }
  }

  tearDown() {
    this._unsubscribeFromDataMaybeChangedMessages();
  }

  // Assumes data, if provided, is valid
  _encodeForRedis(data) {
    if (!data) {
      return;
    }

    for (const key in data) {
      data[key] = JSON.stringify(data[key]);
    }

    return data;
  }

  // Assumes data, if provided, is valid
  _decodeFromRedis(data) {
    if (!data) {
      return {};
    }

    for (const key in data) {
      data[key] = JSON.parse(data[key]);
    }

    return data;
  }

  // Assumes data, if provided, is valid
  _replace(data) {
    // TODO: remove
    this.logger.debug('[pk] replacing...', data);

    // Validation: we should have data
    if (!data) {
      return;
    }

    // Different cases can be optimally handled by different Redis commands
    // - Empty data
    // - Non-empty data
    if (Object.keys(data).length === 0) {
      // Case: empty data
      // TODO: remove
      this.logger.debug('[pk] [replacing] case empty data...', data);
      this.redis.del(this.key);
    } else {
      // Case: non-empty data
      // TODO: remove
      this.logger.debug('[pk] [replacing] case non-empty data...', data);
      this.redis.multi().del(this.key).hset(this.key, data).exec();
    }
  }

  // Assumes data and/or keysToDelete, if provided, are valid
  _shallowMerge(data, keysToDelete) {
    // TODO: remove
    this.logger.debug('[pk] shallow merging...', data, keysToDelete);

    // Validation: we should have data and/or keysToDelete
    if (!(data || keysToDelete)) {
      return;
    }

    // Different cases can be optimally handled by different Redis commands
    // - Only data
    // - Only keysToDelete
    // - Both data and keysToDelete
    const hasData = data && Object.keys(data).length > 0;
    const hasKeysToDelete = keysToDelete && keysToDelete.length > 0;
    if (hasData && !hasKeysToDelete) {
      // Case: only data
      // TODO: remove
      this.logger.debug('[pk] [shallow] case only data...', data);
      this.redis.hset(this.key, data);
    } else if (hasKeysToDelete && !hasData) {
      // TODO: remove
      this.logger.debug(
        '[pk] [shallow] case only keysToDelete...',
        keysToDelete
      );
      // Case: only keysToDelete
      this.redis.hdel(this.key, keysToDelete);
    } else if (hasData && hasKeysToDelete) {
      // Case: both data and keysToDelete
      // TODO: remove
      this.logger.debug('[pk] [shallow] case both...', data, keysToDelete);
      this.redis
        .multi()
        .hset(this.key, data)
        .hdel(this.key, keysToDelete)
        .exec();
    }
  }

  _subscribeToDataMaybeChangedMessages() {
    if (this.subscribed) {
      return;
    }

    // For the message that is sent when any calls to hset occur on the session
    // data in Redis:
    // 1. Subscribe to the message
    // 2. Attach a listener for when the message is received

    // 1. Subscribe to the message
    this.subscriberRedis.psubscribe(this.keyspacePattern, (err) => {
      if (err) {
        this.logger.error(
          `Error subscrbing to session data updates for meeting ${mtgStr}`,
          err
        );
      }
    });

    // 2. Attach a listener for when the message is received
    this.subscriberRedis.on('pmessage', this._handleDataMaybeChangedMessage);

    this.subscribed = true;
  }

  _unsubscribeFromDataMaybeChangedMessages() {
    // For the message that is sent when any calls to hset occur on the session
    // data in Redis:
    // 1. Detach the listener for when the message is received
    // 2. Unsubscribe from the message

    // 1. Detach the listener for when the message is received
    this.subscriberRedis.off('pmessage', this._handleDataMaybeChangedMessage);

    // 2. Unsubscribe from the message
    this.subscriberRedis.punsubscribe(this.keyspacePattern, (err) => {
      if (err) {
        this.logger.error(
          `Error unsubscribing from session data updates for meeting ${mtgStr}`,
          err
        );
      }
    });
  }

  _handleDataMaybeChangedMessage = (pattern, channel, message) => {
    // Ignore if the received message is not about this session data
    // (it might be about session data for another meeting, for example)
    // TODO: does the fact that we'll receive *all* 'pmessage' messages here
    // and have to filter them out here constitute a big performance concern?
    // If so, is a potential solution to have a separate Redis client (or at
    // least subscriber client) for each SigGroup? I was hoping to minimize the
    // number of Redis clients connected to our Redis instance by having one per
    // SFU server, but maybe that's not the right thing to optimize for...
    if (pattern !== this.keyspacePattern) {
      return;
    }
    this.redis.hgetall(this.key).then((data) => {
      data = this._decodeFromRedis(data);
      // TODO: remove eventually
      this.logger.debug('[pk] data maybe changed', data);
      if (!dequal(data, this.data)) {
        // TODO: remove eventually
        this.logger.debug('[pk] data DID change', data);
        this.data = data;
        this.dataChangeHandler();
      }
    });
  };
}
