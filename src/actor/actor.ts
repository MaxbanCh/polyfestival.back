import { type Actor } from '../types/actor';
import pool from '../database/database';

function displayActor(actor: Actor): string {
  return `Id : ${actor.id},  Actor: ${actor.name}, Type: ${actor.actorType.join(', ')}, Description: ${actor.description}`;
}

const ACTOR_TYPE_ALIASES: Record<string, string> = {
  editor: 'PUBLISHER',
  publisher: 'PUBLISHER',
  distributor: 'PROVIDER',
  provider: 'PROVIDER',
  shop: 'SHOP',
  boutique: 'SHOP',
  association: 'ASSOCIATION',
  animation: 'ANIMATION',
};

const ACTOR_TYPE_ALLOWED = new Set([
  'PUBLISHER',
  'PROVIDER',
  'SHOP',
  'ASSOCIATION',
  'ANIMATION',
]);

function normalizeActorType(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (ACTOR_TYPE_ALLOWED.has(upper)) return upper;
  const mapped = ACTOR_TYPE_ALIASES[raw.toLowerCase()];
  return mapped ?? null;
}

function normalizeActorTypes(types: string[] | string | undefined | null): string[] {
  const list = Array.isArray(types) ? types : [types ?? ''];
  const normalized = list
    .map((t) => normalizeActorType(String(t)))
    .filter((t): t is string => Boolean(t));
  return Array.from(new Set(normalized));
}

function serializeTypes(types: string[] | string | undefined | null): string {
  const normalized = normalizeActorTypes(types);
  return normalized.join(',');
}

function parseTypes(types: string | null | undefined): string[] {
  if (!types) return [];
  return normalizeActorTypes(
    String(types)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean),
  );
}

async function getActor(id: number): Promise<Actor | null> {
  if (id <= 0) {
    return null;
  }
  const res = await pool.query('SELECT * FROM actors WHERE id = $1', [id]);
  if (res.rows.length === 0) {
    return null;
  }
  const row = res.rows[0];
  return {
    id: row.id,
    name: row.name,
    actorType: parseTypes(row.actor_type),
    email: row.email ?? null,
    phone: row.phone ?? null,
    description: row.description ?? null,
  };
}

async function listActor(): Promise<Actor[]> {
  const res = await pool.query('SELECT * FROM actors ORDER BY name;');
  return res.rows.map((row) => ({
    id: row.id,
    name: row.name,
    actorType: parseTypes(row.actor_type),
    email: row.email ?? null,
    phone: row.phone ?? null,
    description: row.description ?? null,
  }));
}

async function addActor(actor: Omit<Actor, 'id'>): Promise<Actor> {
  console.log('Adding actor:', actor);
  const res = await pool.query(
    `INSERT INTO actors (name, actor_type, email, phone, description)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      actor.name,
      serializeTypes(actor.actorType),
      actor.email ?? null,
      actor.phone ?? null,
      actor.description ?? null,
    ],
  );
  const row = res.rows[0];
  return {
    id: row.id,
    name: row.name,
    actorType: parseTypes(row.actor_type),
    email: row.email ?? null,
    phone: row.phone ?? null,
    description: row.description ?? null,
  };
}

async function updateActor(actor: Actor): Promise<Actor | null> {
  const res = await pool.query(
    `UPDATE actors
     SET name = $1, actor_type = $2, email = $3, phone = $4, description = $5
     WHERE id = $6 RETURNING *`,
    [
      actor.name,
      serializeTypes(actor.actorType),
      actor.email ?? null,
      actor.phone ?? null,
      actor.description ?? null,
      actor.id,
    ],
  );
  if (res.rowCount === 0) {
    return null;
  }
  const row = res.rows[0];
  return {
    id: row.id,
    name: row.name,
    actorType: parseTypes(row.actor_type),
    email: row.email ?? null,
    phone: row.phone ?? null,
    description: row.description ?? null,
  };
}

async function deleteActor(id: number): Promise<{ deleted: boolean; reason?: string }> {
  // Check if actor has reservations
  const reservationCount = await pool.query(
    'SELECT COUNT(*) AS count FROM reservations WHERE reservant_id = $1',
    [id],
  );
  if (Number(reservationCount.rows[0]?.count ?? 0) > 0) {
    return { deleted: false, reason: 'Acteur lié à des réservations' };
  }

  // Check if actor has games
  const gameCount = await pool.query(
    'SELECT COUNT(*) AS count FROM games WHERE editor_id = $1',
    [id],
  );
  if (Number(gameCount.rows[0]?.count ?? 0) > 0) {
    return { deleted: false, reason: 'Acteur lié à des jeux' };
  }

  // Check if actor has festival associations
  const festivalCount = await pool.query(
    'SELECT COUNT(*) AS count FROM actor_festivals WHERE actor_id = $1',
    [id],
  );
  if (Number(festivalCount.rows[0]?.count ?? 0) > 0) {
    return { deleted: false, reason: 'Acteur déjà exposé sur un festival' };
  }

  // Check if actor has reservation games
  const reservationGamesCount = await pool.query(
    'SELECT COUNT(*) AS count FROM reservation_games WHERE editor_actor_id = $1',
    [id],
  );
  if (Number(reservationGamesCount.rows[0]?.count ?? 0) > 0) {
    return { deleted: false, reason: 'Acteur lié à des jeux de réservation' };
  }

  const res = await pool.query('DELETE FROM actors WHERE id = $1', [id]);
  return { deleted: (res.rowCount ?? 0) > 0 };
}

export {
  displayActor,
  getActor,
  listActor,
  addActor,
  updateActor,
  deleteActor,
};
