import type { ScratchCodeFormat } from '@unbogi/shared';
export interface SendFormState {
  receiverId: string;
  searchQuery: string;
  holidayId: string;
  greeting: string;
  unpackDate: string;
  payloadFormat: ScratchCodeFormat;
  payloadContent: string;
}

export type SendFormErrorKey = 'receiverId' | 'holidayId' | 'greeting' | 'unpackDate' | 'payload' | 'submit';

export const initialState: SendFormState = {
  receiverId: '',
  searchQuery: '',
  holidayId: '',
  greeting: '',
  unpackDate: '',
  payloadFormat: 'code',
  payloadContent: '',
};

export type FormAction =
  | { type: 'SET_RECEIVER'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_HOLIDAY'; payload: string }
  | { type: 'SET_GREETING'; payload: string }
  | { type: 'SET_UNPACK_DATE'; payload: string }
  | { type: 'SET_PAYLOAD_FORMAT'; payload: ScratchCodeFormat }
  | { type: 'SET_PAYLOAD_CONTENT'; payload: string }
  | { type: 'RESET' };

export function formReducer(state: SendFormState, action: FormAction): SendFormState {
  switch (action.type) {
    case 'SET_RECEIVER':
      return { ...state, receiverId: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_HOLIDAY':
      return { ...state, holidayId: action.payload };
    case 'SET_GREETING':
      return { ...state, greeting: action.payload };
    case 'SET_UNPACK_DATE':
      return { ...state, unpackDate: action.payload };
    case 'SET_PAYLOAD_FORMAT':
      return { ...state, payloadFormat: action.payload, payloadContent: '' };
    case 'SET_PAYLOAD_CONTENT':
      return { ...state, payloadContent: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
