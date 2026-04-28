import { create } from 'zustand';

interface SendModalState {
  isSendModalOpen: boolean;
  openSendModal: () => void;
  closeSendModal: () => void;
}

export const useSendModalStore = create<SendModalState>((set) => ({
  isSendModalOpen: false,
  openSendModal: () => set({ isSendModalOpen: true }),
  closeSendModal: () => set({ isSendModalOpen: false }),
}));
