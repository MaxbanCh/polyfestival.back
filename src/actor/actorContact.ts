import pool from '../database/database';
import type { ActorContact } from '../types/actorContact';
import { getActor } from './actor';

export async function getActorContactbyActor(
  actorId: number,
): Promise<ActorContact | null> {
  if (actorId <= 0) {
    return null;
  }
  if (!(await getActor(actorId))) {
    return null;
  }
  const res = await pool.query(
    'SELECT * FROM actor_contacts WHERE actor_id = $1',
    [actorId],
  );
  if (res.rows.length === 0) {
    return null;
  }
  const row = res.rows[0];
  return {
    id: row.id,
    actorId: row.actor_id,
    name: row.name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function addActorContact(
  actorContact: Omit<ActorContact, 'id' | 'created_at' | 'updated_at'>,
): Promise<ActorContact> {
  const res = await pool.query(
    `INSERT INTO actor_contacts (actor_id, name, role, email, phone, notes)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      actorContact.actorId,
      actorContact.name,
      actorContact.role,
      actorContact.email,
      actorContact.phone,
      actorContact.notes,
    ],
  );
  const row = res.rows[0];
  return {
    id: row.id,
    actorId: row.actor_id,
    name: row.name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function updateActorContact(
  actorContact: ActorContact,
): Promise<ActorContact | null> {
  const res = await pool.query(
    `UPDATE actor_contacts
            SET actor_id = $1, name = $2, role = $3, email = $4, phone = $5, notes = $6, updated_at = NOW()
            WHERE id = $7 RETURNING *`,
    [
      actorContact.actorId,
      actorContact.name,
      actorContact.role,
      actorContact.email,
      actorContact.phone,
      actorContact.notes,
      actorContact.id,
    ],
  );
  if (res.rowCount === 0) {
    return null;
  }
  const row = res.rows[0];
  return {
    id: row.id,
    actorId: row.actor_id,
    name: row.name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function deleteActorContact(id: number): Promise<boolean> {
  const res = await pool.query('DELETE FROM actor_contacts WHERE id = $1', [
    id,
  ]);
  return (res.rowCount ?? 0) > 0;
}
