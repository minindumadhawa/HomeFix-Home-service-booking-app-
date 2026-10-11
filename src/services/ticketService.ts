import {
  collection,
  doc,
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
import { SupportTicket, TicketStatus } from '../types/ticket';

const LOCAL_TICKETS_STORAGE_KEY = '@homefix_local_tickets_v1';

export function generateTicketId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${randomNum}`;
}

async function getLocalTickets(): Promise<SupportTicket[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_TICKETS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SupportTicket[];
  } catch (err) {
    console.warn('Could not read local tickets:', err);
    return [];
  }
}

async function saveLocalTickets(tickets: SupportTicket[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.warn('Could not save local tickets:', err);
  }
}

/**
 * CREATE a new support ticket
 */
export async function createSupportTicket(payload: Partial<SupportTicket>): Promise<SupportTicket> {
  const user = auth.currentUser;
  const ticketId = payload.id || generateTicketId();
  const userId = user?.uid || payload.userId || 'guest_user';

  const newTicket: SupportTicket = {
    id: ticketId,
    userId: userId,
    userName: user?.displayName || payload.userName || 'Customer',
    userEmail: user?.email || payload.userEmail || '',
    userPhone: payload.userPhone || user?.phoneNumber || '',
    topic: payload.topic || 'General Inquiry',
    subject: payload.subject || 'Support Request',
    description: payload.description || '',
    status: (payload.status as TicketStatus) || 'Open',
    priority: payload.priority || 'Medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to local cache
  try {
    const local = await getLocalTickets();
    const updated = [newTicket, ...local.filter((t) => t.id !== newTicket.id)];
    await saveLocalTickets(updated);
  } catch (e) {
    console.warn('Local ticket cache write failed:', e);
  }

  // 2. Save to Firestore
  try {
    const docRef = doc(db, 'support_tickets', ticketId);
    await setDoc(docRef, newTicket);
  } catch (err) {
    console.warn('Firestore ticket write failed:', err);
  }

  return newTicket;
}

/**
 * GET current user's tickets
 */
export async function getUserTickets(userId?: string): Promise<SupportTicket[]> {
  const currentUid = userId || auth.currentUser?.uid;

  // Try Firestore
  if (currentUid) {
    try {
      const q = query(collection(db, 'support_tickets'), where('userId', '==', currentUid));
      const snap = await getDocs(q);
      const list: SupportTicket[] = [];
      snap.forEach((d) => list.push(d.data() as SupportTicket));

      if (list.length > 0) {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        await saveLocalTickets(list);
        return list;
      }
    } catch (err) {
      console.warn('Error fetching user tickets from Firestore:', err);
    }
  }

  // Fallback to local
  const local = await getLocalTickets();
  if (currentUid) {
    return local.filter((t) => t.userId === currentUid);
  }
  return local;
}

/**
 * GET ALL tickets for Admin
 */
export async function getAllTickets(): Promise<SupportTicket[]> {
  try {
    const snap = await getDocs(collection(db, 'support_tickets'));
    const list: SupportTicket[] = [];
    snap.forEach((d) => list.push(d.data() as SupportTicket));

    if (list.length > 0) {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    }
  } catch (err) {
    console.warn('Error fetching all tickets from Firestore:', err);
  }

  return await getLocalTickets();
}

/**
 * UPDATE a ticket (e.g. status, admin response, or edit by user)
 */
export async function updateTicket(id: string, payload: Partial<SupportTicket>): Promise<boolean> {
  const updateData = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  // 1. Update local
  try {
    const local = await getLocalTickets();
    const updated = local.map((t) => (t.id === id ? { ...t, ...updateData } : t));
    await saveLocalTickets(updated);
  } catch (e) {
    console.warn('Local update failed:', e);
  }

  // 2. Update Firestore
  try {
    const docRef = doc(db, 'support_tickets', id);
    await updateDoc(docRef, updateData);
    return true;
  } catch (err) {
    console.warn('Firestore ticket update failed:', err);
    return true;
  }
}

/**
 * DELETE a ticket
 */
export async function deleteTicket(id: string): Promise<boolean> {
  // 1. Local
  try {
    const local = await getLocalTickets();
    const filtered = local.filter((t) => t.id !== id);
    await saveLocalTickets(filtered);
  } catch (e) {
    console.warn('Local delete failed:', e);
  }

  // 2. Firestore
  try {
    const docRef = doc(db, 'support_tickets', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Firestore delete failed:', err);
    return true;
  }
}
