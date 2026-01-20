export interface ReservationContact {
  id: number;
  reservationId: number;
  contactId: number;
  contactDate: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}