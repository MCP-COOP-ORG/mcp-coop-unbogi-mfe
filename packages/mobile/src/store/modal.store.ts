import { create } from 'zustand';

type ModalId = 'invite' | 'send';

interface ModalStore {
  activeModal: ModalId | null;
  open: (id: ModalId) => void;
  close: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  activeModal: null,
  open: (id) => set({ activeModal: id }),
  close: () => set({ activeModal: null }),
}));
