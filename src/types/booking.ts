export type BookingStatus = 'Upcoming' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  providerId?: string;
  providerName: string;
  providerTitle?: string;
  providerAvatar?: string;
  serviceTitle: string;
  category: string;
  selectedDate: string;
  selectedTime: string;
  status: BookingStatus;
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending' | 'Cash';
  cardLast4?: string;
  addressType?: string;
  addressLabel?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressPhone?: string;
  landmarkInstruction?: string;
  issueDescription?: string;
  attachedPhotos?: string[];
  createdAt: string;
  updatedAt?: string;
}
