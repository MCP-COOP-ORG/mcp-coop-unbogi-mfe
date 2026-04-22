export type PayloadType = 'text' | 'qr';

export interface SendFormState {
  receiverId: string;
  searchQuery: string;
  holidayId: string;
  greeting: string;
  unpackDate: string;
  payloadType: PayloadType;
  payloadContent: string;
}

export const initialState: SendFormState = {
  receiverId: '',
  searchQuery: '',
  holidayId: '',
  greeting: '',
  unpackDate: '',
  payloadType: 'text',
  payloadContent: '',
};

export type FormAction =
  | { type: 'SET_FIELD'; field: keyof SendFormState; value: string }
  | { type: 'SET_PAYLOAD_TYPE'; value: PayloadType }
  | { type: 'RESET' };

export function formReducer(state: SendFormState, action: FormAction): SendFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_PAYLOAD_TYPE':
      return { ...state, payloadType: action.value, payloadContent: '' };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
