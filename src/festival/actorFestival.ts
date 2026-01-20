import { Router } from 'express';
import pool from '../database/database';
import type { ActorFestival } from '../types/actorFestival';
import { ReservationStatus } from '../types/reservation';

const router = Router();

export async function getActorFestivalsByFestival(
  festivalId: number,
): Promise<ActorFestival[]> {
  if (festivalId <= 0) {
    return [];
  }
  const res = await pool.query(
    'SELECT * FROM actor_festivals WHERE festival_id = $1 ORDER BY id',
    [festivalId],
  );
  return res.rows;
}

export async function getAllActorFestivals(): Promise<ActorFestival[]> {
  const res = await pool.query('SELECT * FROM actor_festivals ORDER BY id');
  return res.rows;
}

export async function addActorToFestival(
  festivalId: number,
  actorId: number,
): Promise<ActorFestival | null> {
  if (festivalId <= 0 || actorId <= 0) {
    return null;
  }
  const res = await pool.query(
    `INSERT INTO actor_festivals (festival_id, actor_id)
     VALUES ($1, $2)
     ON CONFLICT (festival_id, actor_id) DO UPDATE SET actor_id = EXCLUDED.actor_id
     RETURNING *`,
    [festivalId, actorId],
  );
  return res.rows[0] || null;
}

export async function deleteActorFromFestival(
  festivalId: number,
  actorId: number,
): Promise<boolean> {
  if (festivalId <= 0 || actorId <= 0) {
    return false;
  }
  const res = await pool.query(
    'DELETE FROM actor_festivals WHERE festival_id = $1 AND actor_id = $2',
    [festivalId, actorId],
  );
  return (res.rowCount ?? 0) > 0;
}

export async function markActorAsContacted(
  festivalId: number,
  actorId: number,
): Promise<ActorFestival | null> {
  if (festivalId <= 0 || actorId <= 0) {
    return null;
  }
  const res = await pool.query(
    `UPDATE actor_festivals
     SET contacted = TRUE, last_contact_date = CURRENT_TIMESTAMP
     WHERE festival_id = $1 AND actor_id = $2
     RETURNING *`,
    [festivalId, actorId],
  );
  return res.rows[0] || null;
}

export async function updateActorFestivalStatus(
  festivalId: number,
  actorId: number,
  status: ReservationStatus,
): Promise<ActorFestival | null> {
  if (festivalId <= 0 || actorId <= 0) {
    return null;
  }
  const res = await pool.query(
    `UPDATE actor_festivals
     SET status = $3
     WHERE festival_id = $1 AND actor_id = $2
     RETURNING *`,
    [festivalId, actorId, status],
  );
  return res.rows[0] || null;
}
