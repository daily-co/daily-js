/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://acme.dailywebrtc.com/my-room"}
 */

import {
  callObjectBundleUrlCandidates,
  setResolvedBaseDomain,
  DAILY_BASE_DOMAINS,
} from '../utils';

// window.location.hostname === 'acme.dailywebrtc.com' for this entire file,
// set by the @jest-environment-options URL above.

describe('page-domain seeding (window.location = acme.dailywebrtc.com)', () => {
  beforeEach(() => {
    setResolvedBaseDomain(null);
  });

  test('callObjectBundleUrlCandidates starts from the page domain when resolvedBaseDomain is null', () => {
    const candidates = callObjectBundleUrlCandidates({});
    expect(candidates).toHaveLength(DAILY_BASE_DOMAINS.length);
    expect(candidates[0]).toContain('https://c.dailywebrtc.com/');
    expect(candidates[1]).toContain('https://c.daily.co/');
  });

  test('resolvedBaseDomain takes priority over the page domain', () => {
    setResolvedBaseDomain('dailywebrtc.net');
    const candidates = callObjectBundleUrlCandidates({});
    expect(candidates[0]).toContain('https://c.dailywebrtc.net/');
    expect(candidates[1]).not.toContain('https://c.dailywebrtc.net/');
  });

});
