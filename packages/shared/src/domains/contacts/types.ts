export interface Contact {
  id: string;
  displayName: string;
  telegramId?: number;
}

export interface ContactsState {
  contacts: Contact[];
  isLoading: boolean;
  isLoaded: boolean;
  loadContacts: () => Promise<void>;
  reset: () => void;
}
