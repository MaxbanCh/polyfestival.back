import pool from '../database/database';
import type { ReservationGame } from '../types/reservationGame';

function toNumber(value: string | number | null): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function getGamesByReservation(
  reservationId: number,
): Promise<ReservationGame[]> {
  if (reservationId <= 0) {
    return [];
  }
  const res = await pool.query(
    'SELECT * FROM reservation_games WHERE reservation_id = $1 ORDER BY id',
    [reservationId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    gameId: row.game_id,
    editorActorId: row.editor_actor_id ?? undefined,
    tablesNeeded: toNumber(row.tables_needed) ?? undefined,
    chairsNeeded: row.chairs_needed ?? undefined,
    outletsNeeded: row.outlets_needed ?? undefined,
  }));
}

export async function getGamesByFestival(
  festivalId: number,
): Promise<ReservationGame[]> {
  if (festivalId <= 0) {
    return [];
  }
  const res = await pool.query(
    `SELECT rg.*
     FROM reservation_games rg
     JOIN reservations r ON r.id = rg.reservation_id
     WHERE r.festival_id = $1
     ORDER BY rg.id`,
    [festivalId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    gameId: row.game_id,
    editorActorId: row.editor_actor_id ?? undefined,
    tablesNeeded: toNumber(row.tables_needed) ?? undefined,
    chairsNeeded: row.chairs_needed ?? undefined,
    outletsNeeded: row.outlets_needed ?? undefined,
  }));
}

export async function getAllGames(): Promise<ReservationGame[]> {
  const res = await pool.query('SELECT * FROM reservation_games ORDER BY id');
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    gameId: row.game_id,
    editorActorId: row.editor_actor_id ?? undefined,
    tablesNeeded: toNumber(row.tables_needed) ?? undefined,
    chairsNeeded: row.chairs_needed ?? undefined,
    outletsNeeded: row.outlets_needed ?? undefined,
  }));
}

export async function addReservationGame(
  game: Omit<ReservationGame, 'id'>,
): Promise<ReservationGame> {
  const res = await pool.query(
    `INSERT INTO reservation_games
       (reservation_id, game_id, editor_actor_id, tables_needed, chairs_needed, outlets_needed)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      game.reservationId,
      game.gameId,
      game.editorActorId ?? null,
      game.tablesNeeded ?? null,
      game.chairsNeeded ?? null,
      game.outletsNeeded ?? null,
    ],
  );
  const row = res.rows[0];
  return {
    id: row.id,
    reservationId: row.reservation_id,
    gameId: row.game_id,
    editorActorId: row.editor_actor_id ?? undefined,
    tablesNeeded: toNumber(row.tables_needed) ?? undefined,
    chairsNeeded: row.chairs_needed ?? undefined,
    outletsNeeded: row.outlets_needed ?? undefined,
  };
}

export async function updateReservationGame(
  id: number,
  updates: Partial<Omit<ReservationGame, 'id'>>,
): Promise<ReservationGame | null> {
  if (id <= 0) {
    return null;
  }

  const res = await pool.query(
    `UPDATE reservation_games
     SET
       reservation_id = COALESCE($1, reservation_id),
       game_id = COALESCE($2, game_id),
       editor_actor_id = COALESCE($3, editor_actor_id),
       tables_needed = COALESCE($4, tables_needed),
       chairs_needed = COALESCE($5, chairs_needed),
       outlets_needed = COALESCE($6, outlets_needed)
     WHERE id = $7
     RETURNING *`,
    [
      updates.reservationId ?? null,
      updates.gameId ?? null,
      updates.editorActorId ?? null,
      updates.tablesNeeded ?? null,
      updates.chairsNeeded ?? null,
      updates.outletsNeeded ?? null,
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
    gameId: row.game_id,
    editorActorId: row.editor_actor_id ?? undefined,
    tablesNeeded: toNumber(row.tables_needed) ?? undefined,
    chairsNeeded: row.chairs_needed ?? undefined,
    outletsNeeded: row.outlets_needed ?? undefined,
  };
}

export async function deleteReservationGame(id: number): Promise<boolean> {
  if (id <= 0) {
    return false;
  }
  const res = await pool.query('DELETE FROM reservation_games WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}
