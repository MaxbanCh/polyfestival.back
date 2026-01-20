export enum ReservationStatus {
  NOT_CONTACTED = 'NOT_CONTACTED',
  CONTACTED = 'CONTACTED',
  DISCUSSION = 'DISCUSSION',
  WILL_BE_ABSENT = 'WILL_BE_ABSENT',
  CONSIDERED_ABSENT = 'CONSIDERED_ABSENT',
  CONFIRMED = 'CONFIRMED',
  INVOICED = 'INVOICED',
  PAID = 'PAID',
}

export default interface Reservation {
  id: number;
  festivalId: number;
  reservantId: number;
  status: ReservationStatus;
  priceBeforeDiscount?: number;
  discountAmount?: number;
  totalPrice?: number;
  freeTables?: number | null;
  presentsGames?: boolean;
  gamesListRequested?: boolean;
  gamesListReceived?: boolean;
  gamesReceived?: boolean;
}
