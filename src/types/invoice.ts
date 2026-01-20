export interface Invoice {
  id: number;
  reservationId: number;
  number: string;
  amountTtc: number;
  vatRate: number;
  issuedAt: string | null;
  dueDate: string | null;
  status: string;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}