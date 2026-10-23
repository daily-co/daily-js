import CallObjectLoader from '../CallObjectLoader';
import { setResolvedBaseDomain } from '../utils';

// Drives the fetch-based load path (LoadAttempt_ReactNative), which is used on
// React Native and - as the legacy default - on web whenever avoidEval is not
// set. We mock global fetch so we can control exactly when headers arrive and
// when (or whether) the body finishes, and use fake timers to step through the
// per-attempt network timeout.
//
// Regression coverage for daily-js#321: the loader used to clear its timeout as
// soon as fetch() resolved (i.e. when headers arrived), so a body that stalled
// left the load hanging forever with no retry or domain failover. The timeout
// is now a single deadline for the whole download (headers + body), matching
// the script-tag loader.
const FETCH_CONFIG = {}; // avoidEval falsy => fetch-based loader
const CLIENT_ID = 'c1';
const TIMEOUT = 20 * 1000; // LOAD_ATTEMPT_NETWORK_TIMEOUT
const BUNDLE = 'window.__bundleRuns = (window.__bundleRuns || 0) + 1;';

// Let pending promise callbacks (microtasks + the loader's chain of internal
// awaits) settle. jsdom has no setImmediate, so just drain the microtask queue
// a generous number of times.
const flush = async () => {
  for (let i = 0; i < 20; i++) {
    await Promise.resolve();
  }
};
const advance = async (ms) => {
  await jest.advanceTimersByTimeAsync(ms);
  await flush();
};

const deferred = () => {
  const d = {};
  d.promise = new Promise((resolve, reject) => {
    d.resolve = resolve;
    d.reject = reject;
  });
  return d;
};

const okResponse = (textPromise) => ({
  ok: true,
  status: 200,
  headers: {},
  text: () => textPromise,
});

describe('CallObjectLoader fetch-based loading (timeout covers the body)', () => {
  let fetchMock;
  let fetches; // [{ url, init, deferred }]

  beforeEach(() => {
    jest.useFakeTimers();
    setResolvedBaseDomain(null);
    window._daily = { pendings: [], instances: { [CLIENT_ID]: {} } };
    window.__bundleRuns = 0;

    fetches = [];
    fetchMock = jest.fn((url, init) => {
      const d = deferred();
      fetches.push({ url, init, deferred: d });
      return d.promise;
    });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.useRealTimers();
    delete global.fetch;
  });

  const load = async () => {
    const success = jest.fn();
    const failure = jest.fn();
    const loader = new CallObjectLoader(CLIENT_ID);
    loader.load(FETCH_CONFIG, success, failure);
    await flush(); // let the loader get through its (non-iOS) cache check
    return { loader, success, failure };
  };

  const lastFetch = () => fetches[fetches.length - 1];
  const respondLast = async (response) => {
    lastFetch().deferred.resolve(response);
    await flush();
  };

  test('complete download within the timeout succeeds', async () => {
    const { success, failure } = await load();
    expect(fetches).toHaveLength(1);
    expect(fetches[0].url).toContain('https://c.daily.co/');

    await advance(5 * 1000); // slow-ish headers
    const body = deferred();
    await respondLast(okResponse(body.promise));
    await advance(5 * 1000); // slow-ish body
    body.resolve(BUNDLE);
    await flush();

    expect(window.__bundleRuns).toBe(1);
    expect(success).toHaveBeenCalledWith(false);
    expect(failure).not.toHaveBeenCalled();

    // and nothing fires later
    await advance(TIMEOUT * 2);
    expect(failure).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalledTimes(1);
  });

  test('headers arrive promptly but the body never completes: times out and fails over', async () => {
    const { success, failure } = await load();
    await respondLast(okResponse(new Promise(() => {}))); // body never resolves

    await advance(TIMEOUT - 1);
    expect(failure).not.toHaveBeenCalled();

    await advance(1);
    expect(failure).toHaveBeenCalledTimes(1);
    expect(failure).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'timeout' }),
      true // willRetry
    );
    // the hung request was aborted...
    expect(fetches[0].init.signal.aborted).toBe(true);
    // ...and we failed over to the next domain
    expect(fetches).toHaveLength(2);
    expect(fetches[1].url).toContain('https://c.dailywebrtc.com/');
    expect(success).not.toHaveBeenCalled();
    expect(window.__bundleRuns).toBe(0);
  });

  test('a body that completes after its attempt timed out is not executed', async () => {
    const { success, failure } = await load();
    const body = deferred();
    await respondLast(okResponse(body.promise));

    await advance(TIMEOUT);
    expect(failure).toHaveBeenCalledTimes(1);
    expect(fetches).toHaveLength(2); // failover attempt underway

    // The stale body finally lands.
    body.resolve(BUNDLE);
    await flush();
    expect(window.__bundleRuns).toBe(0);
    expect(success).not.toHaveBeenCalled();

    // The failover attempt proceeds normally and is the one that wins.
    await respondLast(okResponse(Promise.resolve(BUNDLE)));
    expect(window.__bundleRuns).toBe(1);
    expect(success).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledWith(false);
  });

  test('headers that never arrive still time out (pre-existing behavior)', async () => {
    const { failure } = await load();
    await advance(TIMEOUT);
    expect(failure).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'timeout' }),
      true
    );
    expect(fetches[0].init.signal.aborted).toBe(true);
    expect(fetches).toHaveLength(2);
  });

  test('the timeout is a deadline for the whole download, not just the headers', async () => {
    const { success, failure } = await load();
    await advance(TIMEOUT - 5000); // headers arrived with 5s to spare
    const body = deferred();
    await respondLast(okResponse(body.promise));

    await advance(5000 - 1);
    expect(failure).not.toHaveBeenCalled();

    // Body still hasn't finished at the 20s mark => fail over, even though the
    // body-read phase itself has only been going for 5s.
    await advance(1);
    expect(failure).toHaveBeenCalledTimes(1);
    expect(fetches[0].init.signal.aborted).toBe(true);
    expect(fetches).toHaveLength(2);

    body.resolve(BUNDLE); // late body
    await flush();
    expect(window.__bundleRuns).toBe(0);
    expect(success).not.toHaveBeenCalled();
  });

  test('cancelling during the body read fires no callbacks and aborts the request', async () => {
    const { loader, success, failure } = await load();
    const body = deferred();
    await respondLast(okResponse(body.promise));

    loader.cancel();
    expect(fetches[0].init.signal.aborted).toBe(true);

    body.resolve(BUNDLE); // late body after cancel
    await flush();
    await advance(TIMEOUT * 2);

    expect(window.__bundleRuns).toBe(0);
    expect(success).not.toHaveBeenCalled();
    expect(failure).not.toHaveBeenCalled();
    expect(fetches).toHaveLength(1);
  });

  test('a fetch that rejects after the attempt timed out is reported only once', async () => {
    const { failure } = await load();
    await advance(TIMEOUT);
    expect(failure).toHaveBeenCalledTimes(1);

    // The aborted fetch rejects (as a real AbortController-backed fetch would).
    fetches[0].deferred.reject(new Error('AbortError'));
    await flush();
    expect(failure).toHaveBeenCalledTimes(1);
  });
});
