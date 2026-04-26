import { httpsCallable } from 'firebase/functions';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contactsApi } from './api';
import { useContactsStore } from './store';

describe('Contacts Domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useContactsStore.setState({ contacts: [], isLoading: false, isLoaded: false });
  });

  describe('api', () => {
    it('list should fetch contacts', async () => {
      const mockContacts = [{ id: '1', name: 'Test' }];
      const mockCallable = vi.fn().mockResolvedValue({ data: { contacts: mockContacts } });
      vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

      const result = await contactsApi.list();
      expect(result).toEqual(mockContacts);
      expect(mockCallable).toHaveBeenCalledWith({});
    });
  });

  describe('store', () => {
    it('should load contacts successfully', async () => {
      const mockContacts = [{ id: '1', name: 'Test' }];
      vi.spyOn(contactsApi, 'list').mockResolvedValue(mockContacts as never);

      const store = useContactsStore.getState();
      await store.loadContacts();

      const newState = useContactsStore.getState();
      expect(newState.contacts).toEqual(mockContacts);
      expect(newState.isLoaded).toBe(true);
      expect(newState.isLoading).toBe(false);
    });

    it('should not load if already loading or loaded', async () => {
      useContactsStore.setState({ isLoading: true });
      const spy = vi.spyOn(contactsApi, 'list');
      await useContactsStore.getState().loadContacts();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(contactsApi, 'list').mockRejectedValue(new Error('Test Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await useContactsStore.getState().loadContacts();

      const newState = useContactsStore.getState();
      expect(newState.isLoading).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load contacts:', expect.any(Error));
    });

    it('should reset state', () => {
      useContactsStore.setState({ contacts: [{ id: '1', name: 'Test' }] as never, isLoaded: true, isLoading: true });
      useContactsStore.getState().reset();

      const newState = useContactsStore.getState();
      expect(newState.contacts).toEqual([]);
      expect(newState.isLoaded).toBe(false);
      expect(newState.isLoading).toBe(false);
    });
  });
});
