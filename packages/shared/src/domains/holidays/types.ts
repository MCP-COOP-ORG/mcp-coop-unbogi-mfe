export interface Holiday {
  id: string;
  name: string;
  imageUrl?: string;
  defaultGreeting?: string;
}

export interface HolidaysState {
  holidays: Holiday[];
  isLoading: boolean;
  isLoaded: boolean;
  loadHolidays: () => Promise<void>;
  reset: () => void;
}
