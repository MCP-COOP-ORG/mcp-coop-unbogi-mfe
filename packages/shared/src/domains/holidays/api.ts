import { CLOUD_FUNCTIONS } from '../../constants';
import { functions, httpsCallable } from '../../firebase';
import type { Holiday } from './types';

export const holidaysApi = {
  async list(): Promise<Holiday[]> {
    const fn = httpsCallable<Record<string, never>, { holidays: Holiday[] }>(functions, CLOUD_FUNCTIONS.HOLIDAYS_LIST);
    const { data } = await fn({});
    return data.holidays;
  },
};
