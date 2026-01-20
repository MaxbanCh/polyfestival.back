export interface ReservationGame {
  id: number;
  reservationId: number;
  gameId: number;
  editorActorId?: number;
  tablesNeeded?: number;
  chairsNeeded?: number;
  outletsNeeded?: number;
}
