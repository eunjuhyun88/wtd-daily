import { describe, it, expect } from 'vitest';
import {
  parseViewportTierCookie,
  tierFromUserAgent,
  tierFromWidth,
} from './viewportCookie';

describe('viewportCookie.tierFromWidth', () => {
  it('classifies widths to W-0087 breakpoints', () => {
    expect(tierFromWidth(360)).toBe('MOBILE');
    expect(tierFromWidth(767)).toBe('MOBILE');
    expect(tierFromWidth(768)).toBe('TABLET');
    expect(tierFromWidth(1279)).toBe('TABLET');
    expect(tierFromWidth(1280)).toBe('DESKTOP');
    expect(tierFromWidth(1920)).toBe('DESKTOP');
  });
});

describe('viewportCookie.parseViewportTierCookie', () => {
  it('returns the tier when value is one of the three valid tiers', () => {
    expect(parseViewportTierCookie('MOBILE')).toBe('MOBILE');
    expect(parseViewportTierCookie('TABLET')).toBe('TABLET');
    expect(parseViewportTierCookie('DESKTOP')).toBe('DESKTOP');
  });

  it('returns null for missing or invalid cookie values', () => {
    expect(parseViewportTierCookie(undefined)).toBeNull();
    expect(parseViewportTierCookie('')).toBeNull();
    expect(parseViewportTierCookie('mobile')).toBeNull();
    expect(parseViewportTierCookie('PHABLET')).toBeNull();
  });
});

describe('viewportCookie.tierFromUserAgent', () => {
  it('classifies common mobile user-agents to MOBILE', () => {
    const iphone =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
    expect(tierFromUserAgent(iphone)).toBe('MOBILE');

    const androidPhone =
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36';
    expect(tierFromUserAgent(androidPhone)).toBe('MOBILE');
  });

  it('classifies iPad and Android tablets to TABLET', () => {
    const ipad =
      'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/604.1';
    expect(tierFromUserAgent(ipad)).toBe('TABLET');

    const androidTablet =
      'Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
    expect(tierFromUserAgent(androidTablet)).toBe('TABLET');
  });

  it('falls back to DESKTOP for desktop UAs and missing input', () => {
    const macSafari =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
    expect(tierFromUserAgent(macSafari)).toBe('DESKTOP');
    expect(tierFromUserAgent(null)).toBe('DESKTOP');
    expect(tierFromUserAgent('')).toBe('DESKTOP');
  });
});
