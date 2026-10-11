export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface SupportTicket {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  topic: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  adminResponse?: string;
  createdAt: string;
  updatedAt?: string;
}
