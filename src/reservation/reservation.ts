import type Reservation from '../types/reservation.ts';
import pool from '../database/database.ts';
import { getFestival } from '../festival/festival.ts';
import { getActor } from '../actor/actor.ts';

async function addReservation(
  reservation: Omit<Reservation, 'id'>,
): Promise<Reservation> {
  const festival = await getFestival(reservation.festivalId);
  if (festival === null) {
    throw new Error(
      `Festival with id ${reservation.festivalId} does not exist`,
    );
  }

  const reservant = await getActor(reservation.reservantId);
  if (reservant === null) {
    throw new Error(
      `Reservant with id ${reservation.reservantId} does not exist`,
    );
  }

  const res = await pool.query(
    `INSERT INTO reservations (festival_id, reservant_id, status, price_before_discount, discount_amount, total_price)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      reservation.festivalId,
      reservation.reservantId,
      reservation.status,
      reservation.priceBeforeDiscount,
      reservation.discountAmount,
      reservation.totalPrice,
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
  }));
}

async function listReservationsByFestival(
  festivalId: number,
): Promise<Reservation[]> {
  const festival = await getFestival(festivalId);
  if (festival === null) {
    throw new Error(`Festival with id ${festivalId} does not exist`);
  }

  const res = await pool.query(
    'SELECT * FROM reservations WHERE festival_id = $1 ORDER BY id;',
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
  }));
}

async function listReservationsByReservant(
  reservantId: number,
): Promise<Reservation[]> {
  const reservant = await getActor(reservantId);
  if (reservant === null) {
    throw new Error(`Reservant with id ${reservantId} does not exist`);
  }

  const res = await pool.query(
    'SELECT * FROM reservations WHERE reservant_id = $1 ORDER BY id;',
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
  }));
}

async function updateReservation(
  reservation: Reservation,
): Promise<Reservation | null> {
  const res = await pool.query(
    `UPDATE reservations
         SET festival_id = $1, reservant_id = $2, status = $3, price_before_discount = $4, discount_amount = $5, total_price = $6
         WHERE id = $7 RETURNING *`,
    [
      reservation.festivalId,
      reservation.reservantId,
      reservation.status,
      reservation.priceBeforeDiscount,
      reservation.discountAmount,
      reservation.totalPrice,
      reservation.id,
    ],
  );
  if (res.rows.length === 0) {
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
  };
}

export {
  addReservation,
  getReservation,
  listReservations,
  listReservationsByFestival,
  listReservationsByReservant,
  updateReservation,
};
