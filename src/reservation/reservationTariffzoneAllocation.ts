import pool from '../database/database';
import type { ReservationTariffzoneAllocation } from '../types/reservationTariffzoneAllocation';

const TABLE_AREA_M2 = 4;

async function getTariffzoneCapacity(tariffzoneId: number) {
  const { rows } = await pool.query(
    'SELECT id, nbtable, available_tables FROM tarif_zones WHERE id = $1',
    [tariffzoneId],
  );
  return rows[0] ?? null;
}

async function sumAllocatedTables(tariffzoneId: number, excludeId?: number) {
  const { rows } = await pool.query(
    `
      SELECT COALESCE(SUM(quantity_tables), 0) AS total_tables,
             COALESCE(SUM(quantity_area_sqm), 0) AS total_area
      FROM reservation_tariffzone_allocations
      WHERE tariffzone_id = $1
      ${Number.isFinite(excludeId) ? 'AND id <> $2' : ''}
    `,
    Number.isFinite(excludeId) ? [tariffzoneId, excludeId] : [tariffzoneId],
  );
  const tables = Number(rows[0]?.total_tables ?? 0);
  const area = Number(rows[0]?.total_area ?? 0);
  return tables + area / TABLE_AREA_M2;
}

async function refreshAvailableTables(tariffzoneId: number) {
  const cap = await getTariffzoneCapacity(tariffzoneId);
  if (!cap) return;
  const allocated = await sumAllocatedTables(tariffzoneId);
  const available = Math.max(0, Number(cap.nbtable ?? 0) - allocated);
  await pool.query(
    'UPDATE tarif_zones SET available_tables = $1 WHERE id = $2',
    [available, tariffzoneId],
  );
}

export async function getAllocationsByReservation(
  reservationId: number,
): Promise<ReservationTariffzoneAllocation[]> {
  if (reservationId <= 0) {
    return [];
  }
  const res = await pool.query(
    'SELECT * FROM reservation_tariffzone_allocations WHERE reservation_id = $1 ORDER BY id',
    [reservationId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    tariffzoneId: row.tariffzone_id,
    quantityTables: row.quantity_tables,
    quantityAreaSqm: Number(row.quantity_area_sqm ?? 0),
  }));
}

export async function getAllocationsByFestival(
  festivalId: number,
): Promise<ReservationTariffzoneAllocation[]> {
  if (festivalId <= 0) {
    return [];
  }
  const res = await pool.query(
    `SELECT rta.*
     FROM reservation_tariffzone_allocations rta
     JOIN reservations r ON r.id = rta.reservation_id
     WHERE r.festival_id = $1
     ORDER BY rta.id`,
    [festivalId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    tariffzoneId: row.tariffzone_id,
    quantityTables: row.quantity_tables,
    quantityAreaSqm: Number(row.quantity_area_sqm ?? 0),
  }));
}

export async function getAllAllocations(): Promise<ReservationTariffzoneAllocation[]> {
  const res = await pool.query(
    'SELECT * FROM reservation_tariffzone_allocations ORDER BY id',
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    tariffzoneId: row.tariffzone_id,
    quantityTables: row.quantity_tables,
    quantityAreaSqm: Number(row.quantity_area_sqm ?? 0),
  }));
}

export async function addAllocation(
  allocation: Omit<ReservationTariffzoneAllocation, 'id'>,
): Promise<ReservationTariffzoneAllocation | null> {
  if (allocation.quantityTables < 0 || allocation.quantityAreaSqm < 0) {
    throw new Error('quantites doivent être >= 0');
  }

  const cap = await getTariffzoneCapacity(allocation.tariffzoneId);
  if (!cap) {
    throw new Error('Zone tarifaire introuvable');
  }

  const already = await sumAllocatedTables(allocation.tariffzoneId);
  const eqTables = allocation.quantityTables + (allocation.quantityAreaSqm / TABLE_AREA_M2);
  if (already + eqTables > Number(cap.nbtable ?? 0)) {
    throw new Error('Capacité de la zone tarifaire dépassée');
  }

  const res = await pool.query(
    `INSERT INTO reservation_tariffzone_allocations
       (reservation_id, tariffzone_id, quantity_tables, quantity_area_sqm)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      allocation.reservationId,
      allocation.tariffzoneId,
      allocation.quantityTables,
      allocation.quantityAreaSqm,
    ],
  );

  await refreshAvailableTables(allocation.tariffzoneId);

  const row = res.rows[0];
  return {
    id: row.id,
    reservationId: row.reservation_id,
    tariffzoneId: row.tariffzone_id,
    quantityTables: row.quantity_tables,
    quantityAreaSqm: Number(row.quantity_area_sqm ?? 0),
  };
}

export async function updateAllocation(
  id: number,
  updates: {
    reservationId?: number;
    tariffzoneId?: number;
    quantityTables?: number;
    quantityAreaSqm?: number;
  },
): Promise<ReservationTariffzoneAllocation | null> {
  if (id <= 0) {
    return null;
  }

  const current = await pool.query(
    'SELECT * FROM reservation_tariffzone_allocations WHERE id = $1',
    [id],
  );
  const existing = current.rows[0];
  if (!existing) {
    return null;
  }

  const nextTariffzoneId = updates.tariffzoneId ?? existing.tariffzone_id;
  const nextQuantity = updates.quantityTables ?? existing.quantity_tables;
  const nextArea = updates.quantityAreaSqm ?? existing.quantity_area_sqm;

  if (nextQuantity < 0 || nextArea < 0) {
    throw new Error('quantites doivent être >= 0');
  }

  const cap = await getTariffzoneCapacity(nextTariffzoneId);
  if (!cap) {
    throw new Error('Zone tarifaire introuvable');
  }

  const already = await sumAllocatedTables(nextTariffzoneId, id);
  const nextEqTables = nextQuantity + (nextArea / TABLE_AREA_M2);
  if (already + nextEqTables > Number(cap.nbtable ?? 0)) {
    throw new Error('Capacité de la zone tarifaire dépassée');
  }

  const res = await pool.query(
    `UPDATE reservation_tariffzone_allocations
     SET
       reservation_id = COALESCE($1, reservation_id),
       tariffzone_id = COALESCE($2, tariffzone_id),
       quantity_tables = COALESCE($3, quantity_tables),
       quantity_area_sqm = COALESCE($4, quantity_area_sqm)
     WHERE id = $5
     RETURNING *`,
    [
      updates.reservationId ?? null,
      updates.tariffzoneId ?? null,
      updates.quantityTables ?? null,
      updates.quantityAreaSqm ?? null,
      id,
    ],
  );

  if (res.rows.length === 0) {
    return null;
  }

  await refreshAvailableTables(nextTariffzoneId);

  const row = res.rows[0];
  return {
    id: row.id,
    reservationId: row.reservation_id,
    tariffzoneId: row.tariffzone_id,
    quantityTables: row.quantity_tables,
    quantityAreaSqm: Number(row.quantity_area_sqm ?? 0),
  };
}

export async function deleteAllocation(id: number): Promise<boolean> {
  if (id <= 0) {
    return false;
  }

  const current = await pool.query(
    'SELECT * FROM reservation_tariffzone_allocations WHERE id = $1',
    [id],
  );
  const existing = current.rows[0];

  const res = await pool.query(
    'DELETE FROM reservation_tariffzone_allocations WHERE id = $1',
    [id],
  );

  if ((res.rowCount ?? 0) > 0 && existing) {
    await refreshAvailableTables(existing.tariffzone_id);
    return true;
  }

  return false;
}