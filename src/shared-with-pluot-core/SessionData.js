import { dequal } from 'dequal';
import { MAX_SESSION_DATA_SIZE } from './CommonIncludes';

export const REPLACE_STRATEGY = 'replace';
export const SHALLOW_MERGE_STRATEGY = 'shallow-merge';
export const MERGE_STRATEGIES = [REPLACE_STRATEGY, SHALLOW_MERGE_STRATEGY];

const UNDEF_REPL = '__undefined__';

export default class SessionData {
  constructor({ data, mergeStrategy } = {}) {
    this.validateAndSetMergeStrategy(mergeStrategy);
    this.validateAndSetData(data);
  }

  validateAndSetMergeStrategy(strategy) {
    if (strategy === undefined) {
      return true;
    }
    if (MERGE_STRATEGIES.includes(strategy)) {
      this.mergeStrategy = strategy;
    } else {
      throw Error(
        `Invalid mergeStrategy provided. Options are: [${MERGE_STRATEGIES}]`
      );
    }
  }

  validateAndSetData(data) {
    this.data = data;
    if (data === undefined || data === null) {
      return true;
    }
    if (this.shouldShallowMerge(data)) {
      this.data = data;
      if (!this.isShallowMergeable()) {
        this.data = undefined;
        throw Error(
          `For shallow merges, the sessionData must be a map-like object`
        );
      }
    }
    let dataStr;
    if (typeof data === 'string') {
      // JSON.stringify adds two characters to the string, so do sizing checks
      // on the raw string.
      dataStr = data;
    } else {
      try {
        dataStr = this.toJSONString();
        // check that what goes in is the same coming out :)
        const out = this.constructor.JSONObjectFromJSONString(dataStr);
        if (!dequal(out.data, data)) {
          console.warn(
            `The sessionData provided will be modified when serialized.`,
            out.data,
            data
          );
        }
      } catch (e) {
        this.data = undefined;
        throw Error(`sessionData must be serializable to JSON: ${e}`);
      }
    }

    // check the size of the payload
    if (dataStr.length > MAX_SESSION_DATA_SIZE) {
      this.data = undefined;
      throw Error(
        `sessionData is too large (${dataStr.length} characters). Maximum size suppported is ${MAX_SESSION_DATA_SIZE}.`
      );
    }
    return true;
  }

  toJSONString() {
    const keepUndefined = (key, value) => {
      return value === undefined ? UNDEF_REPL : value;
    };
    return JSON.stringify(this.toJSONObject(), keepUndefined);
  }

  toJSONObject() {
    return { data: this.data, mergeStrategy: this.mergeStrategy };
  }

  static JSONObjectFromJSONString(string) {
    const recursivelyFixUndefined = (jsonObj) => {
      if (jsonObj && typeof jsonObj === 'object') {
        for (const [k, v] of Object.entries(jsonObj)) {
          if (v && typeof v === 'object') {
            recursivelyFixUndefined(jsonObj[k]);
          } else if (v === UNDEF_REPL) {
            jsonObj[k] = undefined;
          }
        }
      }
      return jsonObj;
    };
    let json = JSON.parse(string);
    return recursivelyFixUndefined(json);
  }

  shouldShallowMerge(newerSessionData) {
    if (newerSessionData.data === null || newerSessionData.data === undefined) {
      return false;
    }
    return newerSessionData.mergeStrategy === SHALLOW_MERGE_STRATEGY;
  }

  isShallowMergeable() {
    if (this.data == null || typeof this.data !== 'object') {
      return false;
    }
    const proto = Object.getPrototypeOf(this.data);
    if (proto == null) {
      return true;
    }
    return proto === Object.prototype;
  }

  // assumes mergeStrategy has already been validated
  // and returns true if data was modified.
  updateFrom(newerSessionData) {
    const prevData = { ...this.data };
    // update data according to the strategy
    if (this.shouldShallowMerge(newerSessionData)) {
      // if shallow-merge is specified but either set of data is not
      // a valid key/val object, then no-op, do not collect $200.
      if (
        !(this.isShallowMergeable() && newerSessionData.isShallowMergeable())
      ) {
        return false;
      }
      this.data = {
        ...this.data,
        ...newerSessionData.data,
      };
    } else {
      if (newerSessionData.data && typeof newerSessionData.data === 'object') {
        this.data = { ...newerSessionData.data };
      } else {
        this.data = newerSessionData.data;
      }
    }
    // update merge strategy only if defined and previous strategy
    // was not REPLACE. This is useful when caching client-side.
    if (
      newerSessionData.mergeStrategy &&
      this.mergeStrategy !== REPLACE_STRATEGY
    ) {
      this.mergeStrategy = newerSessionData.mergeStrategy;
    }

    // filter out all undefined keys
    if (this.data && typeof this.data === 'object') {
      let d2 = Object.fromEntries(
        Object.entries(this.data).filter(([, val]) => {
          return val !== undefined;
        })
      );
      this.data = d2;
    }

    return !dequal(prevData, this.data);
  }

  clone() {
    return new SessionData({
      data: JSON.parse(JSON.stringify(this.data)),
      mergeStrategy: this.mergeStrategy,
    });
  }
}
