import AsyncStorage from '@react-native-async-storage/async-storage';

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

export interface BookingRecord {
  id: string;
  createdAt: string;
  status: BookingStatus;
  serviceTitle: string;
  providerName: string;
  providerTitle: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  rate: string;
  paymentMethod: string;
  notes: string;
  rating?: number;
  review?: string;
}

const STORAGE_KEY = '@homefix/bookings/v1';

export async function getBookings(): Promise<BookingRecord[]> {
  const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
  if (!storedValue) {
    return [];
  }

  const parsedValue: unknown = JSON.parse(storedValue);
  if (!Array.isArray(parsedValue)) {
    throw new Error('Saved bookings have an invalid format.');
  }

  return parsedValue as BookingRecord[];
}

export async function createBooking(booking: BookingRecord): Promise<void> {
  const bookings = await getBookings();
  if (bookings.some((item) => item.id === booking.id)) {
    return;
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([booking, ...bookings]));
}

export async function updateBooking(
  id: string,
  updates: Partial<Pick<BookingRecord, 'status' | 'rating' | 'review'>>
): Promise<void> {
  const bookings = await getBookings();
  const bookingIndex = bookings.findIndex((booking) => booking.id === id);
  if (bookingIndex === -1) {
    throw new Error(`Booking ${id} was not found.`);
  }

  bookings[bookingIndex] = { ...bookings[bookingIndex], ...updates };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}
