export enum ReservantType {
  EDITOR,
  FESTIVAL,
  ORGANIZATION,
  ANIMATOR,
}

export interface Reservant {
  id: number;
  name: string;
  reservantType: ReservantType;
  billingaddress: string;
}
