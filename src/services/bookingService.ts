import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';
import { Booking, BookingStatus } from '../types/booking';

const LOCAL_BOOKINGS_STORAGE_KEY = '@homefix_local_bookings_v1';

/**
 * Generates a clean human-readable booking code (e.g. #HF-89421)
 */
export function generateBookingId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `HF-${randomNum}`;
}

/**
 * Helper to get local bookings from AsyncStorage
 */
async function getLocalBookings(): Promise<Booking[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_BOOKINGS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Booking[];
  } catch (err) {
    console.warn('Could not read local bookings storage:', err);
    return [];
  }
}

/**
 * Helper to save local bookings to AsyncStorage
 */
async function saveLocalBookings(bookings: Booking[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (err) {
    console.warn('Could not write local bookings storage:', err);
  }
}

/**
 * CREATE a new booking in Firestore and local cache
 */
export async function createBooking(payload: Partial<Booking>): Promise<Booking> {
  const user = auth.currentUser;
  const bookingId = payload.id || generateBookingId();
  const userId = user?.uid || payload.userId || 'guest_user';

  const newBooking: Booking = {
    id: bookingId,
    userId: userId,
    userName: user?.displayName || payload.userName || 'Client',
    userPhone: payload.userPhone || user?.phoneNumber || '+94 77 123 4567',
    providerId: payload.providerId || 'pro-assigned',
    providerName: payload.providerName || 'Nimal Silva',
    providerTitle: payload.providerTitle || 'Master Electrical Specialist',
    providerAvatar:
      payload.providerAvatar ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    serviceTitle: payload.serviceTitle || 'Electrical Safety & Circuit Audit',
    category: payload.category || 'Electrical',
    selectedDate: payload.selectedDate || 'Thu, Oct 8, 2026',
    selectedTime: payload.selectedTime || '10:30 AM',
    status: (payload.status as BookingStatus) || 'Upcoming',
    totalAmount: payload.totalAmount || '2,320.00',
    paymentMethod: payload.paymentMethod || 'Cash on Completion',
    paymentStatus: payload.paymentStatus || (payload.paymentMethod === 'Credit / Debit Card' ? 'Paid' : 'Pending'),
    cardLast4: payload.cardLast4,
    addressType: payload.addressType || 'Home',
    addressLabel: payload.addressLabel || 'Home Address',
    addressLine1: payload.addressLine1 || 'No 45/A, Temple Road',
    addressLine2: payload.addressLine2 || 'Colombo 03, Western Province',
    addressPhone: payload.addressPhone || '+94 77 123 4567',
    landmarkInstruction: payload.landmarkInstruction || '',
    issueDescription: payload.issueDescription || '',
    attachedPhotos: payload.attachedPhotos || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to local storage cache immediately
  try {
    const local = await getLocalBookings();
    const updated = [newBooking, ...local.filter((b) => b.id !== bookingId)];
    await saveLocalBookings(updated);
  } catch (err) {
    console.warn('Error saving booking to local cache:', err);
  }

  // 2. Sync to Firestore 'bookings' collection
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await setDoc(docRef, newBooking, { merge: true });
  } catch (dbErr) {
    console.warn('Firestore write for booking failed (saved locally):', dbErr);
  }

  return newBooking;
}

/**
 * READ all bookings for current user (or all locally recorded bookings)
 */
export async function getUserBookings(): Promise<Booking[]> {
  const currentUid = auth.currentUser?.uid;
  const bookingsMap: Record<string, Booking> = {};

  // First seed with local storage
  const localList = await getLocalBookings();
  localList.forEach((b) => {
    bookingsMap[b.id] = b;
  });

  // Then fetch from Firestore
  try {
    const bookingsCol = collection(db, 'bookings');
    let snap;
    if (currentUid) {
      // Query by user ID
      const q = query(bookingsCol, where('userId', '==', currentUid));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(bookingsCol);
    }

    if (!snap.empty) {
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Booking;
        const id = data.id || docSnap.id;
        bookingsMap[id] = { ...data, id };
      });

      // Update local storage with fresh data from database
      await saveLocalBookings(Object.values(bookingsMap));
    }
  } catch (error) {
    console.warn('Firestore read for bookings failed, using local storage fallback:', error);
  }

  // Return sorted by creation date (newest first)
  return Object.values(bookingsMap).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * READ single booking by ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  // Check local first
  const local = await getLocalBookings();
  const foundLocal = local.find((b) => b.id === id);

  try {
    const docRef = doc(db, 'bookings', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Booking;
    }
  } catch (err) {
    console.warn(`Firestore read for booking ${id} failed:`, err);
  }

  return foundLocal || null;
}

/**
 * UPDATE booking details (date, time, status, notes, etc.)
 */
export async function updateBooking(id: string, updates: Partial<Booking>): Promise<boolean> {
  const updatedAt = new Date().toISOString();
  const payload = { ...updates, updatedAt };

  // 1. Update local storage
  try {
    const local = await getLocalBookings();
    const updated = local.map((b) => (b.id === id ? { ...b, ...payload } : b));
    await saveLocalBookings(updated);
  } catch (err) {
    console.warn('Error updating local booking:', err);
  }

  // 2. Update Firestore
  try {
    const docRef = doc(db, 'bookings', id);
    await updateDoc(docRef, payload);
    return true;
  } catch (err) {
    console.warn(`Firestore update for booking ${id} failed:`, err);
    return true; // Still true since local updated
  }
}

/**
 * RESCHEDULE booking (shortcut for date & time update)
 */
export async function rescheduleBooking(id: string, newDate: string, newTime: string): Promise<boolean> {
  return updateBooking(id, {
    selectedDate: newDate,
    selectedTime: newTime,
    status: 'Upcoming',
  });
}

/**
 * CANCEL a booking
 */
export async function cancelBooking(id: string, reason?: string): Promise<boolean> {
  return updateBooking(id, {
    status: 'Cancelled',
    landmarkInstruction: reason ? `Cancelled: ${reason}` : undefined,
  });
}

/**
 * MARK a booking as COMPLETED
 */
export async function completeBooking(id: string): Promise<boolean> {
  return updateBooking(id, {
    status: 'Completed',
    paymentStatus: 'Paid',
  });
}

/**
 * DELETE a booking record completely from database and local storage
 */
export async function deleteBooking(id: string): Promise<boolean> {
  // 1. Delete from local storage
  try {
    const local = await getLocalBookings();
    const filtered = local.filter((b) => b.id !== id);
    await saveLocalBookings(filtered);
  } catch (err) {
    console.warn('Error deleting local booking:', err);
  }

  // 2. Delete from Firestore
  try {
    const docRef = doc(db, 'bookings', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn(`Firestore delete for booking ${id} failed:`, err);
    return true;
  }
}
