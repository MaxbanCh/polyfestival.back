export interface ReservationContact {
  id: number;
  reservationId: number;
  contactId: number | null;
  contactDate: string | null;
  notes: string | null;
}