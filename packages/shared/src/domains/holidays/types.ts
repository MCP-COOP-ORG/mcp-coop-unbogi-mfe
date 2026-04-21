export interface Holiday {
  id: string;
  name: string;
  date: string;
  imageUrl?: string;
}

export interface HolidaysState {
  holidays: Holiday[];
  isLoading: boolean;
  isLoaded: boolean;
  loadHolidays: () => Promise<void>;
  reset: () => void;
}
