import {
  DAILY_BASE_DOMAINS,
  callObjectBundleUrl,
  callObjectBundleUrlCandidates,
  baseDomainFromUrl,
  getResolvedBaseDomain,
  setResolvedBaseDomain,
} from '../utils';

describe('bundle domain failover (utils)', () => {
  beforeEach(() => {
    // reset the module-level sticky resolved domain between tests
    setResolvedBaseDomain(null);
  });

  test('DAILY_BASE_DOMAINS lists daily.co first, then the .com/.net fallbacks', () => {
    expect(DAILY_BASE_DOMAINS).toEqual([
      'daily.co',
      'dailywebrtc.com',
      'dailywebrtc.net',
    ]);
  });

  test('callObjectBundleUrl builds the bundle URL for a given domain', () => {
    expect(callObjectBundleUrl({}, 'dailywebrtc.com')).toContain(
      'https://c.dailywebrtc.com/call-machine/'
    );
    // defaults to the primary domain
    expect(callObjectBundleUrl({})).toContain(
      'https://c.daily.co/call-machine/'
    );
  });

  describe('callObjectBundleUrlCandidates', () => {
    test('returns one URL per domain, in DAILY_BASE_DOMAINS order', () => {
      const candidates = callObjectBundleUrlCandidates({});
      expect(candidates).toHaveLength(DAILY_BASE_DOMAINS.length);
      expect(candidates[0]).toContain('https://c.daily.co/');
      expect(candidates[1]).toContain('https://c.dailywebrtc.com/');
      expect(candidates[2]).toContain('https://c.dailywebrtc.net/');
    });

    test.each([
      [
        'bundlePathOverride',
        { bundlePathOverride: 'https://cdn.example.com/x' },
      ],
      [
        'callObjectBundleUrlOverride',
        { callObjectBundleUrlOverride: 'https://cdn.example.com/x/bundle.js' },
      ],
      ['proxyUrl', { proxyUrl: 'https://proxy.example.com' }],
    ])(
      'collapses to a single URL when %s is set (failover disabled)',
      (_label, cfg) => {
        const candidates = callObjectBundleUrlCandidates(cfg);
        expect(candidates).toHaveLength(1);
        expect(candidates).not.toContain(
          expect.stringContaining('dailywebrtc.com')
        );
      }
    );

    test('once a fallback domain has resolved, it is tried first (sticky)', () => {
      setResolvedBaseDomain('dailywebrtc.com');
      const candidates = callObjectBundleUrlCandidates({});
      expect(candidates).toHaveLength(DAILY_BASE_DOMAINS.length);
      expect(candidates[0]).toContain('https://c.dailywebrtc.com/');
      // the others are still present, just after the sticky one
      expect(candidates.some((u) => u.includes('https://c.daily.co/'))).toBe(
        true
      );
      expect(
        candidates.some((u) => u.includes('https://c.dailywebrtc.net/'))
      ).toBe(true);
    });
  });

  describe('baseDomainFromUrl', () => {
    test.each([
      ['https://c.daily.co/call-machine/x/bundle.js', 'daily.co'],
      ['https://c.dailywebrtc.com/call-machine/x/bundle.js', 'dailywebrtc.com'],
      ['https://gs.staging.dailywebrtc.com/rooms/check', 'dailywebrtc.com'],
      ['https://c.dailywebrtc.net/x', 'dailywebrtc.net'],
      ['https://cdn.example.com/custom/bundle.js', null],
      ['not a url', null],
    ])('%s -> %s', (url, expected) => {
      expect(baseDomainFromUrl(url)).toBe(expected);
    });
  });

  describe('setResolvedBaseDomain', () => {
    test('accepts a known domain, ignores unknown, and clears on null', () => {
      setResolvedBaseDomain('dailywebrtc.net');
      expect(getResolvedBaseDomain()).toBe('dailywebrtc.net');

      setResolvedBaseDomain('evil.example.com');
      expect(getResolvedBaseDomain()).toBe('dailywebrtc.net'); // unchanged

      setResolvedBaseDomain(null);
      expect(getResolvedBaseDomain()).toBe(null);
    });
  });

  // The room-config kill switch (disable_base_domain_fallback) is persisted to
  // localStorage by the call machine; the loader honors it on the next load.
  describe('disable_base_domain_fallback kill switch', () => {
    afterEach(() =>
      localStorage.removeItem('daily:disable-base-domain-fallback')
    );

    test('persisted kill switch collapses to a single candidate (no failover)', () => {
      localStorage.setItem('daily:disable-base-domain-fallback', '1');
      expect(callObjectBundleUrlCandidates({})).toHaveLength(1);
      expect(callObjectBundleUrlCandidates({})[0]).toContain(
        'https://c.daily.co/'
      );
    });

    test('without the kill switch, failover candidates are present', () => {
      expect(callObjectBundleUrlCandidates({}).length).toBeGreaterThan(1);
    });
  });
});
