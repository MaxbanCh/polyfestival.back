import pool from '../database/database';
import type { ReservationNote } from '../types/reservationNote';

export async function getNotesByReservation(
  reservationId: number,
): Promise<ReservationNote[]> {
  if (reservationId <= 0) {
    return [];
  }
  const res = await pool.query(
    'SELECT * FROM reservation_notes WHERE reservation_id = $1 ORDER BY created_at DESC NULLS LAST, id DESC',
    [reservationId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    contactId: row.contact_id,
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function getNotesByFestival(
  festivalId: number,
): Promise<ReservationNote[]> {
  if (festivalId <= 0) {
    return [];
  }
  const res = await pool.query(
    `SELECT rn.*
     FROM reservation_notes rn
     JOIN reservations r ON r.id = rn.reservation_id
     WHERE r.festival_id = $1
     ORDER BY rn.created_at DESC NULLS LAST, rn.id DESC`,
    [festivalId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    contactId: row.contact_id,
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function getAllNotes(): Promise<ReservationNote[]> {
  const res = await pool.query(
    'SELECT * FROM reservation_notes ORDER BY created_at DESC NULLS LAST, id DESC',
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    contactId: row.contact_id,
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function addReservationNote(
  note: Omit<ReservationNote, 'id'>,
): Promise<ReservationNote> {
  const res = await pool.query(
    `INSERT INTO reservation_notes (reservation_id, contact_id, author, content, created_at)
     VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_TIMESTAMP))
     RETURNING *`,
    [
      note.reservationId,
      note.contactId ?? null,
      note.author ?? null,
      note.content,
      note.createdAt ?? null,
    ],
  );
  const row = res.rows[0];
  return {
    id: row.id,
    reservationId: row.reservation_id,
    contactId: row.contact_id,
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function updateReservationNote(
  id: number,
  updates: {
    author?: string | null;
    content?: string | null;
    contactId?: number | null;
  },
): Promise<ReservationNote | null> {
  if (id <= 0) {
    return null;
  }
  const res = await pool.query(
    `UPDATE reservation_notes
     SET
       author = COALESCE($1, author),
       content = COALESCE($2, content),
       contact_id = COALESCE($3, contact_id)
     WHERE id = $4
     RETURNING *`,
    [
      updates.author ?? null,
      updates.content ?? null,
      updates.contactId ?? null,
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
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function deleteReservationNote(id: number): Promise<boolean> {
  if (id <= 0) {
    return false;
  }
  const res = await pool.query(
    'DELETE FROM reservation_notes WHERE id = $1',
    [id],
  );
  return (res.rowCount ?? 0) > 0;
}