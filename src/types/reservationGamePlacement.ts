export interface ReservationGamePlacement {
  id: number;
  reservationId: number;
  gameId: number;
  tablesAllocated: number;
  tableType: string;
  chairsAllocated?: number;
  outletsAllocated?: number;
  mapzoneId: number | null;
}