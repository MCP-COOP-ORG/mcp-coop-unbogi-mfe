import { HttpsError } from 'firebase-functions/v2/https';
import { describe, expect, it } from 'vitest';
import { AppError, errorToHttpsError, isFirebaseError } from './errors';

describe('Errors Utils (Unit)', () => {
  describe('isFirebaseError', () => {
    it('should return true for valid shape', () => {
      expect(isFirebaseError({ code: 'some-code', message: 'msg' })).toBe(true);
    });

    it('should return false for invalid shapes', () => {
      expect(isFirebaseError(null)).toBe(false);
      expect(isFirebaseError(undefined)).toBe(false);
      expect(isFirebaseError('string')).toBe(false);
      expect(isFirebaseError({ code: 'some-code' })).toBe(false);
      expect(isFirebaseError({ message: 'msg' })).toBe(false);
    });
  });

  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const err = new AppError('not-found', 'Not found msg');
      expect(err.code).toBe('not-found');
      expect(err.message).toBe('Not found msg');
      expect(err.name).toBe('AppError');
      expect(err).toBeInstanceOf(Error);
    });
  });

  describe('errorToHttpsError', () => {
    it('should return HttpsError as-is', () => {
      const httpsErr = new HttpsError('already-exists', 'Msg');
      expect(errorToHttpsError(httpsErr)).toBe(httpsErr);
    });

    it('should map AppError to HttpsError', () => {
      const appErr = new AppError('permission-denied', 'Denied');
      const res = errorToHttpsError(appErr);
      expect(res).toBeInstanceOf(HttpsError);
      expect(res.code).toBe('permission-denied');
      expect(res.message).toBe('Denied');
    });

    it('should map Error to HttpsError with internal code', () => {
      const err = new Error('Standard error');
      const res = errorToHttpsError(err);
      expect(res).toBeInstanceOf(HttpsError);
      expect(res.code).toBe('internal');
      expect(res.message).toBe('Standard error');
    });

    it('should fallback to stringified error for unknown types', () => {
      const res = errorToHttpsError('Just a string');
      expect(res).toBeInstanceOf(HttpsError);
      expect(res.code).toBe('internal');
      expect(res.message).toBe('Just a string');
    });
  });
});
