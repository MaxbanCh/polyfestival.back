export interface ReservationNote {
  id: number;
  reservationId: number;
  contactId: number | null;
  author: string | null;
  content: string;
  createdAt: string | null;
}