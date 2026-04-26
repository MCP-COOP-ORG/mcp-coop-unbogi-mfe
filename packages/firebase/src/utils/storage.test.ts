import * as admin from 'firebase-admin';
import type { Timestamp } from 'firebase-admin/firestore';
import { getDownloadURL } from 'firebase-admin/storage';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { mapTimestamp, resolveStorageUrl } from './storage';

vi.mock('firebase-admin', () => ({
  storage: vi.fn().mockReturnValue({
    bucket: vi.fn().mockReturnValue({
      file: vi.fn(),
    }),
  }),
}));

vi.mock('firebase-admin/storage', () => ({
  getDownloadURL: vi.fn(),
}));

vi.mock('firebase-functions/logger', () => ({
  error: vi.fn(),
}));

describe('Storage Utils (Unit)', () => {
  let mockBucketFile: Mock;
  let mockGetDownloadURL: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    const storageMock = admin.storage() as unknown as { bucket: () => { file: Mock } };
    mockBucketFile = storageMock.bucket().file;
    mockGetDownloadURL = getDownloadURL as Mock;
  });

  describe('resolveStorageUrl', () => {
    it('should return empty string for non-string or falsy values', async () => {
      expect(await resolveStorageUrl(null)).toBe('');
      expect(await resolveStorageUrl(undefined)).toBe('');
      expect(await resolveStorageUrl(123)).toBe('');
      expect(await resolveStorageUrl('')).toBe('');
    });

    it('should return URL as is if it starts with http', async () => {
      expect(await resolveStorageUrl('https://example.com/img.png')).toBe('https://example.com/img.png');
    });

    it('should resolve and return download URL for gs:// or raw paths', async () => {
      mockBucketFile.mockReturnValue('mock-file-ref');
      mockGetDownloadURL.mockResolvedValue('https://mocked.url/resolved');

      const result = await resolveStorageUrl('gs://bucket/path.png');
      expect(mockBucketFile).toHaveBeenCalledWith('gs://bucket/path.png');
      expect(mockGetDownloadURL).toHaveBeenCalledWith('mock-file-ref');
      expect(result).toBe('https://mocked.url/resolved');
    });

    it('should handle errors gracefully and fallback to original path', async () => {
      mockGetDownloadURL.mockRejectedValue(new Error('Storage error'));
      const result = await resolveStorageUrl('gs://fail/path.png');
      expect(result).toBe('gs://fail/path.png');
    });
  });

  describe('mapTimestamp', () => {
    it('should return undefined if value is null or undefined', () => {
      expect(mapTimestamp(null)).toBeUndefined();
      expect(mapTimestamp(undefined)).toBeUndefined();
      expect(mapTimestamp({} as unknown as Timestamp)).toBeUndefined();
    });

    it('should convert Timestamp to ISO string', () => {
      const mockDate = new Date('2030-01-01T00:00:00Z');
      const mockTimestamp = { toDate: () => mockDate };
      expect(mapTimestamp(mockTimestamp as unknown as Timestamp)).toBe('2030-01-01T00:00:00.000Z');
    });
  });
});
