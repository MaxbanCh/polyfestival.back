export enum ReservationStatus {
  NOT_CONTACTED,
  CONTACTED,
  DISCUSSION,
  CONSIDERED_ABSENT,
  CONFIRMED,
  INVOICED,
  PAID,
}

export default interface Reservation {
  id: number;
  festivalId: number;
  reservantId: number;
  status: ReservationStatus;
  priceBeforeDiscount?: number;
  discountAmount?: number;
  totalPrice?: number;
}