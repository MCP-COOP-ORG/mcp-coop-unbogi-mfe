import { describe, it, expect } from 'vitest';
import { sanitizeImageUrl, isImageReady } from './sanitize';

describe('sanitize.ts', () => {
  describe('sanitizeImageUrl', () => {
    it('allows https protocol', () => {
      const url = 'https://example.com/image.jpg';
      expect(sanitizeImageUrl(url)).toBe(url);
    });

    it('allows http protocol', () => {
      const url = 'http://example.com/image.jpg';
      expect(sanitizeImageUrl(url)).toBe(url);
    });

    it('allows data protocol', () => {
      const url = 'data:image/png;base64,iVBORw0KGgo=';
      expect(sanitizeImageUrl(url)).toBe(url);
    });

    it('allows relative urls', () => {
      const url = '/assets/img.png';
      expect(sanitizeImageUrl(url)).toBe(url);
    });

    it('blocks dangerous protocols', () => {
      const url = 'javascript:alert(1)';
      expect(sanitizeImageUrl(url)).toBe('about:blank');
    });

    it('blocks vbscript', () => {
      const url = 'vbscript:msgbox(1)';
      expect(sanitizeImageUrl(url)).toBe('about:blank');
    });
  });

  describe('isImageReady', () => {
    it('returns true for valid https urls', () => {
      expect(isImageReady('https://example.com/image.jpg')).toBe(true);
    });

    it('returns false for dangerous urls', () => {
      expect(isImageReady('javascript:alert(1)')).toBe(false);
    });

    it('returns false for undefined, null, or empty string', () => {
      expect(isImageReady(undefined)).toBe(false);
      expect(isImageReady(null)).toBe(false);
      expect(isImageReady('')).toBe(false);
      expect(isImageReady('   ')).toBe(false);
    });

    it('returns true for relative urls', () => {
      expect(isImageReady('/assets/img.png')).toBe(true);
    });
  });
});
