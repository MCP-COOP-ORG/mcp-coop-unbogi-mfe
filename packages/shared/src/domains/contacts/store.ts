import { create } from 'zustand';
import { contactsApi } from './api';
import type { ContactsState } from './types';

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  isLoading: false,
  isLoaded: false,

  loadContacts: async () => {
    if (get().isLoading || get().isLoaded) return;
    set({ isLoading: true });

    try {
      const contacts = await contactsApi.list();
      set({ contacts, isLoaded: true });
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ contacts: [], isLoading: false, isLoaded: false }),
}));
