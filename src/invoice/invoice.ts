import pool from '../database/database';
import type { Invoice } from '../types/invoice';

export async function getInvoicesByReservation(
  reservationId: number,
): Promise<Invoice[]> {
  if (reservationId <= 0) {
    return [];
  }
  const res = await pool.query(
    'SELECT * FROM invoices WHERE reservation_id = $1 ORDER BY id',
    [reservationId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    number: row.number,
    amountTtc: Number(row.amount_ttc) || 0,
    vatRate: Number(row.vat_rate) || 0,
    issuedAt: row.issued_at,
    dueDate: row.due_date,
    status: row.status ?? 'DRAFT',
  }));
}

export async function getAllInvoices(): Promise<Invoice[]> {
  const res = await pool.query('SELECT * FROM invoices ORDER BY id');
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    number: row.number,
    amountTtc: Number(row.amount_ttc) || 0,
    vatRate: Number(row.vat_rate) || 0,
    issuedAt: row.issued_at,
    dueDate: row.due_date,
    status: row.status ?? 'DRAFT',
  }));
}

export async function addInvoice(
  reservationId: number,
  amountTtc: number,
  vatRate: number = 20,
): Promise<Invoice> {
  const number = `INV-${Date.now()}`;
  const res = await pool.query(
    `INSERT INTO invoices (reservation_id, number, amount_ttc, vat_rate, issued_at, status)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'DRAFT')
     RETURNING *`,
    [reservationId, number, amountTtc, vatRate],
  );
  const row = res.rows[0];
  return {
    id: row.id,
    reservationId: row.reservation_id,
    number: row.number,
    amountTtc: Number(row.amount_ttc) || 0,
    vatRate: Number(row.vat_rate) || 0,
    issuedAt: row.issued_at,
    dueDate: row.due_date,
    status: row.status ?? 'DRAFT',
  };
}

export async function markInvoiceAsPaid(id: number): Promise<Invoice | null> {
  if (id <= 0) {
    return null;
  }
  const res = await pool.query(
    `UPDATE invoices
     SET status = 'PAID',
         issued_at = COALESCE(issued_at, CURRENT_TIMESTAMP)
     WHERE id = $1
     RETURNING *`,
    [id],
  );
  if (res.rows.length === 0) {
    return null;
  }
  const row = res.rows[0];
  return {
    id: row.id,
    reservationId: row.reservation_id,
    number: row.number,
    amountTtc: Number(row.amount_ttc) || 0,
    vatRate: Number(row.vat_rate) || 0,
    issuedAt: row.issued_at,
    dueDate: row.due_date,
    status: row.status ?? 'DRAFT',
  };
}

export async function updateInvoice(
  id: number,
  updates: {
    amountTtc?: number;
    vatRate?: number;
    status?: string;
    issuedAt?: string;
    dueDate?: string;
  },
): Promise<Invoice | null> {
  if (id <= 0) {
    return null;
  }
  const res = await pool.query(
    `UPDATE invoices
     SET
       amount_ttc = COALESCE($1, amount_ttc),
       vat_rate = COALESCE($2, vat_rate),
       status = COALESCE($3, status),
       issued_at = COALESCE($4, issued_at),
       due_date = COALESCE($5, due_date)
     WHERE id = $6
     RETURNING *`,
    [
      updates.amountTtc ?? null,
      updates.vatRate ?? null,
      updates.status ?? null,
      updates.issuedAt ?? null,
      updates.dueDate ?? null,
      id,
    ],
  );
  if (res.rows.length === 0) {
    return null;
  }
  const row = res.rows[0];
  return {
    id: row.id,
    reservationId: row.reservation_id,
    number: row.number,
    amountTtc: Number(row.amount_ttc) || 0,
    vatRate: Number(row.vat_rate) || 0,
    issuedAt: row.issued_at,
    dueDate: row.due_date,
    status: row.status ?? 'DRAFT',
  };
}

export async function deleteInvoice(id: number): Promise<boolean> {
  if (id <= 0) {
    return false;
  }
  const res = await pool.query('DELETE FROM invoices WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}