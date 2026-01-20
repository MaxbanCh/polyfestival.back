import pool from '../database/database';
import type Reservation from '../types/reservation';
import { ReservationStatus } from '../types/reservation';
import { getFestival } from '../festival/festival';
import { getActor } from '../actor/actor';

async function addReservation(
  reservation: Omit<Reservation, 'id'>,
): Promise<Reservation> {
  const festival = await getFestival(reservation.festivalId);
  if (festival === null) {
    throw new Error('Festival not found');
  }

  const reservant = await getActor(reservation.reservantId);
  if (reservant === null) {
    throw new Error('Reservant not found');
  }

  const res = await pool.query(
    `INSERT INTO reservations (festival_id, reservant_id, status, price_before_discount, discount_amount, total_price, free_tables, presents_games, games_list_requested, games_list_received, games_received)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [
      reservation.festivalId,
      reservation.reservantId,
      reservation.status,
      reservation.priceBeforeDiscount ?? null,
      reservation.discountAmount ?? null,
      reservation.totalPrice ?? null,
      reservation.freeTables ?? null,
      reservation.presentsGames ?? false,
      reservation.gamesListRequested ?? false,
      reservation.gamesListReceived ?? false,
      reservation.gamesReceived ?? false,
    ],
  );
  const row = res.rows[0];
  return {
    id: row.id,
    festivalId: row.festival_id,
    reservantId: row.reservant_id,
    status: row.status,
    priceBeforeDiscount: row.price_before_discount,
    discountAmount: row.discount_amount,
    totalPrice: row.total_price,
    freeTables: row.free_tables,
    presentsGames: row.presents_games,
    gamesListRequested: row.games_list_requested,
    gamesListReceived: row.games_list_received,
    gamesReceived: row.games_received,
  };
}

async function getReservation(id: number): Promise<Reservation | null> {
  if (id <= 0) {
    return null;
  }
  const res = await pool.query('SELECT * FROM reservations WHERE id = $1', [
    id,
  ]);
  const row = res.rows[0];
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    festivalId: row.festival_id,
    reservantId: row.reservant_id,
    status: row.status,
    priceBeforeDiscount: row.price_before_discount,
    discountAmount: row.discount_amount,
    totalPrice: row.total_price,
    freeTables: row.free_tables,
    presentsGames: row.presents_games,
    gamesListRequested: row.games_list_requested,
    gamesListReceived: row.games_list_received,
    gamesReceived: row.games_received,
  };
}

async function listReservations(): Promise<Reservation[]> {
  const res = await pool.query('SELECT * FROM reservations ORDER BY id;');
  return res.rows.map((row) => ({
    id: row.id,
    festivalId: row.festival_id,
    reservantId: row.reservant_id,
    status: row.status,
    priceBeforeDiscount: row.price_before_discount,
    discountAmount: row.discount_amount,
    totalPrice: row.total_price,
    freeTables: row.free_tables,
    presentsGames: row.presents_games,
    gamesListRequested: row.games_list_requested,
    gamesListReceived: row.games_list_received,
    gamesReceived: row.games_received,
  }));
}

async function listReservationsByFestival(
  festivalId: number,
): Promise<Reservation[]> {
  if (festivalId <= 0) {
    return [];
  }
  const res = await pool.query(
    'SELECT * FROM reservations WHERE festival_id = $1 ORDER BY id',
    [festivalId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    festivalId: row.festival_id,
    reservantId: row.reservant_id,
    status: row.status,
    priceBeforeDiscount: row.price_before_discount,
    discountAmount: row.discount_amount,
    totalPrice: row.total_price,
    freeTables: row.free_tables,
    presentsGames: row.presents_games,
    gamesListRequested: row.games_list_requested,
    gamesListReceived: row.games_list_received,
    gamesReceived: row.games_received,
  }));
}

async function listReservationsByReservant(
  reservantId: number,
): Promise<Reservation[]> {
  if (reservantId <= 0) {
    return [];
  }
  const res = await pool.query(
    'SELECT * FROM reservations WHERE reservant_id = $1 ORDER BY id',
    [reservantId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    festivalId: row.festival_id,
    reservantId: row.reservant_id,
    status: row.status,
    priceBeforeDiscount: row.price_before_discount,
    discountAmount: row.discount_amount,
    totalPrice: row.total_price,
    freeTables: row.free_tables,
    presentsGames: row.presents_games,
    gamesListRequested: row.games_list_requested,
    gamesListReceived: row.games_list_received,
    gamesReceived: row.games_received,
  }));
}

async function updateReservation(
  reservation: Reservation,
): Promise<Reservation | null> {
  const res = await pool.query(
    `UPDATE reservations
     SET festival_id = $1, reservant_id = $2, status = $3, price_before_discount = $4, discount_amount = $5, total_price = $6, free_tables = $7, presents_games = $8, games_list_requested = $9, games_list_received = $10, games_received = $11
     WHERE id = $12 RETURNING *`,
    [
      reservation.festivalId,
      reservation.reservantId,
      reservation.status,
      reservation.priceBeforeDiscount ?? null,
      reservation.discountAmount ?? null,
      reservation.totalPrice ?? null,
      reservation.freeTables ?? null,
      reservation.presentsGames ?? false,
      reservation.gamesListRequested ?? false,
      reservation.gamesListReceived ?? false,
      reservation.gamesReceived ?? false,
      reservation.id,
    ],
  );
  if (res.rowCount === 0) {
    return null;
  }
  const row = res.rows[0];
  return {
    id: row.id,
    festivalId: row.festival_id,
    reservantId: row.reservant_id,
    status: row.status,
    priceBeforeDiscount: row.price_before_discount,
    discountAmount: row.discount_amount,
    totalPrice: row.total_price,
    freeTables: row.free_tables,
    presentsGames: row.presents_games,
    gamesListRequested: row.games_list_requested,
    gamesListReceived: row.games_list_received,
    gamesReceived: row.games_received,
  };
}

async function deleteReservation(id: number): Promise<boolean> {
  if (id <= 0) {
    return false;
  }
  const res = await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

export {
  addReservation,
  getReservation,
  listReservations,
  listReservationsByFestival,
  listReservationsByReservant,
  updateReservation,
  deleteReservation,
};
