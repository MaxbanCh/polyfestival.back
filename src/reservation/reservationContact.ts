import pool from '../database/database';
import type { ReservationContact } from '../types/reservationContact';

export async function getContactsByReservation(
  reservationId: number,
): Promise<ReservationContact[]> {
  if (reservationId <= 0) {
    return [];
  }
  const res = await pool.query(
    'SELECT * FROM reservation_contacts WHERE reservation_id = $1 ORDER BY contact_date DESC NULLS LAST, id DESC',
    [reservationId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    contactId: row.contact_id,
    contactDate: row.contact_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getContactsByFestival(
  festivalId: number,
): Promise<ReservationContact[]> {
  if (festivalId <= 0) {
    return [];
  }
  const res = await pool.query(
    `SELECT rc.*
     FROM reservation_contacts rc
     JOIN reservations r ON r.id = rc.reservation_id
     WHERE r.festival_id = $1
     ORDER BY rc.contact_date DESC NULLS LAST, rc.id DESC`,
    [festivalId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    contactId: row.contact_id,
    contactDate: row.contact_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getAllContacts(): Promise<ReservationContact[]> {
  const res = await pool.query(
    'SELECT * FROM reservation_contacts ORDER BY contact_date DESC NULLS LAST, id DESC',
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    contactId: row.contact_id,
    contactDate: row.contact_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function addReservationContact(
  contact: Omit<ReservationContact, 'id'>,
): Promise<ReservationContact> {
  const res = await pool.query(
    `INSERT INTO reservation_contacts (reservation_id, contact_id, contact_date, notes, created_at, updated_at)
     VALUES ($1, $2, COALESCE($3, CURRENT_TIMESTAMP), $4, COALESCE($5, CURRENT_TIMESTAMP), COALESCE($6, CURRENT_TIMESTAMP))
     RETURNING *`,
    [
      contact.reservationId,
      contact.contactId ?? null,
      contact.contactDate ?? null,
      contact.notes ?? null,
      contact.createdAt ?? null,
      contact.updatedAt ?? null,
    ],
  );
  const row = res.rows[0];
  return {
    id: row.id,
    reservationId: row.reservation_id,
    contactId: row.contact_id,
    contactDate: row.contact_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function updateReservationContact(
  id: number,
  updates: {
    contactId?: number | null;
    contactDate?: string | null;
    notes?: string | null;
    updatedAt?: string | null;
  },
): Promise<ReservationContact | null> {
  if (id <= 0) {
    return null;
  }
  const res = await pool.query(
    `UPDATE reservation_contacts
     SET
       contact_id = COALESCE($1, contact_id),
       contact_date = COALESCE($2, contact_date),
       notes = COALESCE($3, notes),
       updated_at = COALESCE($4, CURRENT_TIMESTAMP)
     WHERE id = $5
     RETURNING *`,
    [
      updates.contactId ?? null,
      updates.contactDate ?? null,
      updates.notes ?? null,
      updates.updatedAt ?? null,
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
    contactId: row.contact_id,
    contactDate: row.contact_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function deleteReservationContact(id: number): Promise<boolean> {
  if (id <= 0) {
    return false;
  }
  const res = await pool.query(
    'DELETE FROM reservation_contacts WHERE id = $1',
    [id],
  );
  return (res.rowCount ?? 0) > 0;
}