import CallObjectLoader from '../CallObjectLoader';
import { getResolvedBaseDomain, setResolvedBaseDomain } from '../utils';

// Drives the web (script-tag) load path: avoidEval:true selects LoadAttempt_Web,
// and we intercept head.appendChild to capture each <script> and manually fire
// its onload/onerror, simulating per-domain success/failure without real I/O.
const WEB_CONFIG = { avoidEval: true };
const CLIENT_ID = 'c1';

describe('CallObjectLoader domain failover', () => {
  let scripts;

  beforeEach(() => {
    jest.useFakeTimers();
    setResolvedBaseDomain(null);
    scripts = [];
    window._daily = { pendings: [], instances: { [CLIENT_ID]: {} } };
    delete window._dailyCallMachineLoadWaitlist;

    const head = document.getElementsByTagName('head')[0];
    jest.spyOn(head, 'appendChild').mockImplementation((el) => {
      scripts.push(el);
      return el;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const load = () => {
    const success = jest.fn();
    const failure = jest.fn();
    new CallObjectLoader(CLIENT_ID).load(WEB_CONFIG, success, failure);
    return { success, failure };
  };

  const lastScript = () => scripts[scripts.length - 1];
  const succeedLast = () => lastScript().onload();
  const failLast = () =>
    lastScript().onerror({ target: { src: lastScript().src }, message: 'err' });

  test('primary (daily.co) success: one script, records daily.co', () => {
    const { success } = load();
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toContain('https://c.daily.co/');

    succeedLast();
    expect(success).toHaveBeenCalledWith(false); // false = not a no-op
    expect(getResolvedBaseDomain()).toBe('daily.co');
  });

  test('primary error fails over to .com immediately (no delay) and wins', () => {
    const { success, failure } = load();
    expect(scripts[0].src).toContain('https://c.daily.co/');

    failLast();
    // failed over without advancing any timers
    expect(failure).toHaveBeenCalledWith(expect.anything(), true); // willRetry
    expect(scripts).toHaveLength(2);
    expect(scripts[1].src).toContain('https://c.dailywebrtc.com/');

    succeedLast();
    expect(success).toHaveBeenCalledWith(false);
    expect(getResolvedBaseDomain()).toBe('dailywebrtc.com');
  });

  test('primary network timeout fails over to the next domain', () => {
    load();
    expect(scripts[0].src).toContain('https://c.daily.co/');

    jest.advanceTimersByTime(20 * 1000); // per-candidate network timeout
    expect(scripts).toHaveLength(2);
    expect(scripts[1].src).toContain('https://c.dailywebrtc.com/');
  });

  test('failing the whole list starts a fresh pass after the backoff delay', () => {
    load();
    failLast(); // daily.co
    failLast(); // dailywebrtc.com
    expect(scripts).toHaveLength(3);
    expect(scripts[2].src).toContain('https://c.dailywebrtc.net/');

    failLast(); // dailywebrtc.net -> end of pass 1
    // no immediate 4th attempt; it's scheduled behind the backoff delay
    expect(scripts).toHaveLength(3);

    jest.advanceTimersByTime(3 * 1000); // LOAD_ATTEMPT_DELAY
    expect(scripts).toHaveLength(4);
    expect(scripts[3].src).toContain('https://c.daily.co/'); // pass 2 from the top
  });

  test('a failed-over script cannot double-execute (onload neutralized)', () => {
    const { success } = load();
    failLast(); // fail daily.co -> its handlers should be cleared
    expect(scripts[0].onload).toBeNull();
    expect(scripts[0].onerror).toBeNull();

    succeedLast(); // dailywebrtc.com wins
    expect(success).toHaveBeenCalledTimes(1);
  });

  test('a resolved fallback domain is tried first on the next load (sticky)', () => {
    // first load fails over to .com
    load();
    failLast();
    succeedLast();
    expect(getResolvedBaseDomain()).toBe('dailywebrtc.com');

    // second load should lead with the sticky domain
    scripts.length = 0;
    window._daily.instances[CLIENT_ID] = {};
    load();
    expect(scripts[0].src).toContain('https://c.dailywebrtc.com/');
  });
});
