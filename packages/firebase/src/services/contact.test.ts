import { FALLBACK_NAMES } from '@unbogi/contracts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactService } from './contact';

describe('ContactService (Unit)', () => {
  let contactService: ContactService;
  let mockContactRepo: any;

  beforeEach(() => {
    mockContactRepo = {
      getContacts: vi.fn(),
      getUsersByIds: vi.fn(),
    };
    contactService = new ContactService(mockContactRepo);
  });

  describe('listContacts', () => {
    it('should return empty list if no contacts found', async () => {
      mockContactRepo.getContacts.mockResolvedValue({ empty: true });

      const result = await contactService.listContacts('user1');

      expect(result).toEqual({ contacts: [] });
      expect(mockContactRepo.getUsersByIds).not.toHaveBeenCalled();
    });

    it('should return contacts with resolved display names', async () => {
      mockContactRepo.getContacts.mockResolvedValue({
        empty: false,
        docs: [
          { data: () => ({ userId: 'friend1' }) },
          { data: () => ({ userId: 'friend2' }) },
          { data: () => ({ userId: 'friend3' }) },
        ],
      });

      mockContactRepo.getUsersByIds.mockResolvedValue([
        { exists: true, id: 'friend1', data: () => ({ displayName: 'Alice' }) },
        { exists: true, id: 'friend2', data: () => ({ nickname: 'Bob' }) },
        { exists: false, id: 'friend3', data: () => null },
      ]);

      const result = await contactService.listContacts('user1');

      expect(mockContactRepo.getContacts).toHaveBeenCalledWith('user1');
      expect(mockContactRepo.getUsersByIds).toHaveBeenCalledWith(['friend1', 'friend2', 'friend3']);
      expect(result).toEqual({
        contacts: [
          { id: 'friend1', displayName: 'Alice' },
          { id: 'friend2', displayName: 'Bob' },
          { id: 'friend3', displayName: FALLBACK_NAMES.UNKNOWN },
        ],
      });
    });
  });
});
