import pool from '../database/database';
import type { ReservationGamePlacement } from '../types/reservationGamePlacement';

const TABLE_AREA_M2 = 4;

function chairsForType(tableType: string): number | null {
  // Define chair capacity per table type
  const chairMap: Record<string, number> = {
    small: 4,
    medium: 6,
    large: 8,
  };
  return chairMap[tableType] ?? null;
}

function toNumber(value: string | number | null): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function getReservationFestivalId(reservationId: number): Promise<number | null> {
  const { rows } = await pool.query('SELECT festival_id FROM reservations WHERE id = $1', [reservationId]);
  return rows[0]?.festival_id ?? null;
}

async function getMapzone(mapzoneId: number) {
  const { rows } = await pool.query(
    'SELECT id, festival_id, nbtable, surface, tariffzoneid FROM map_zones WHERE id = $1',
    [mapzoneId],
  );
  return rows[0] ?? null;
}

async function sumTablesAllocatedByMapzone(mapzoneId: number, excludeId?: number): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(tables_allocated), 0) AS total
     FROM reservation_game_placements
     WHERE mapzone_id = $1
     ${Number.isFinite(excludeId) ? 'AND id <> $2' : ''}`,
    Number.isFinite(excludeId) ? [mapzoneId, excludeId] : [mapzoneId],
  );
  return Number(rows[0]?.total ?? 0);
}

async function sumTablesAllocatedByTariffzone(
  reservationId: number,
  tariffzoneId: number,
  excludeId?: number,
): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(rgp.tables_allocated), 0) AS total
     FROM reservation_game_placements rgp
     JOIN map_zones mz ON mz.id = rgp.mapzone_id
     WHERE rgp.reservation_id = $1 AND mz.tariffzoneid = $2
     ${Number.isFinite(excludeId) ? 'AND rgp.id <> $3' : ''}`,
    Number.isFinite(excludeId) ? [reservationId, tariffzoneId, excludeId] : [reservationId, tariffzoneId],
  );
  return Number(rows[0]?.total ?? 0);
}

async function sumBookedTablesByTariffzone(reservationId: number, tariffzoneId: number): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(quantity_tables), 0) AS total_tables,
            COALESCE(SUM(quantity_area_sqm), 0) AS total_area
     FROM reservation_tariffzone_allocations
     WHERE reservation_id = $1 AND tariffzone_id = $2`,
    [reservationId, tariffzoneId],
  );
  const tables = Number(rows[0]?.total_tables ?? 0);
  const area = Number(rows[0]?.total_area ?? 0);
  return tables + area / TABLE_AREA_M2;
}

async function getTableStockMax(festivalId: number, tableType: string): Promise<number | null> {
  const { rows } = await pool.query(
    'SELECT quantity FROM tables WHERE festivalid = $1 AND type = $2',
    [festivalId, tableType],
  );
  if (!rows[0]) return null;
  const max = Number(rows[0].quantity);
  return Number.isFinite(max) ? max : null;
}

async function sumTablesAllocatedByTypeFestival(
  festivalId: number,
  tableType: string,
  excludeId?: number,
): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(rgp.tables_allocated), 0) AS total
     FROM reservation_game_placements rgp
     JOIN reservations r ON r.id = rgp.reservation_id
     WHERE r.festival_id = $1 AND rgp.table_type = $2
     ${Number.isFinite(excludeId) ? 'AND rgp.id <> $3' : ''}`,
    Number.isFinite(excludeId) ? [festivalId, tableType, excludeId] : [festivalId, tableType],
  );
  return Number(rows[0]?.total ?? 0);
}

async function validatePlacement(
  payload: {
    reservationId: number;
    tableType: string;
    tablesAllocated: number;
    chairsAllocated: number | null;
    outletsAllocated: number | null;
    mapzoneId: number | null;
  },
  currentId?: number,
): Promise<{ ok: boolean; error?: string; chairsAllocated?: number | null }> {
  const { reservationId, tableType, tablesAllocated, chairsAllocated, mapzoneId } = payload;

  if (!Number.isFinite(tablesAllocated) || tablesAllocated < 0) {
    return { ok: false, error: 'tablesAllocated invalide' };
  }

  const chairsPerTable = chairsForType(tableType);
  let resolvedChairs = chairsAllocated;
  if (chairsPerTable != null) {
    const maxChairs = tablesAllocated * chairsPerTable;
    if (resolvedChairs == null) resolvedChairs = maxChairs;
    if (tablesAllocated >= 0 && resolvedChairs > maxChairs) {
      return { ok: false, error: 'Nombre de chaises dépasse le maximum pour ce type de table' };
    }
  }

  if (mapzoneId != null) {
    const mapzone = await getMapzone(mapzoneId);
    if (!mapzone) return { ok: false, error: 'Zone du plan introuvable' };

    const usedTables = await sumTablesAllocatedByMapzone(mapzoneId, currentId);
    if (usedTables + tablesAllocated > Number(mapzone.nbtable ?? 0)) {
      return { ok: false, error: 'Capacité de la zone du plan dépassée (tables)' };
    }

    const usedArea = usedTables * TABLE_AREA_M2;
    const nextArea = usedArea + tablesAllocated * TABLE_AREA_M2;
    const surface = Number(mapzone.surface ?? 0);
    if (surface > 0 && nextArea > surface) {
      return { ok: false, error: 'Capacité de la zone du plan dépassée (surface)' };
    }

    const booked = await sumBookedTablesByTariffzone(reservationId, mapzone.tariffzoneid);
    if (booked > 0) {
      const already = await sumTablesAllocatedByTariffzone(reservationId, mapzone.tariffzoneid, currentId);
      if (already + tablesAllocated > booked) {
        return { ok: false, error: 'Tables réservées dans la zone tarifaire dépassées' };
      }
    }
  }

  const festivalId = await getReservationFestivalId(reservationId);
  if (festivalId != null) {
    const maxStock = await getTableStockMax(festivalId, tableType);
    if (maxStock != null) {
      const already = await sumTablesAllocatedByTypeFestival(festivalId, tableType, currentId);
      if (already + tablesAllocated > maxStock) {
        return { ok: false, error: 'Stock de tables insuffisant pour ce type' };
      }
    }
  }

  return { ok: true, chairsAllocated: resolvedChairs };
}

export async function getPlacementsByReservation(
  reservationId: number,
): Promise<ReservationGamePlacement[]> {
  if (reservationId <= 0) {
    return [];
  }
  const res = await pool.query(
    'SELECT * FROM reservation_game_placements WHERE reservation_id = $1 ORDER BY id',
    [reservationId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    gameId: row.game_id,
    tablesAllocated: toNumber(row.tables_allocated) ?? 0,
    tableType: row.table_type,
    chairsAllocated: row.chairs_allocated ?? undefined,
    outletsAllocated: row.outlets_allocated ?? undefined,
    mapzoneId: row.mapzone_id ?? null,
  }));
}

export async function getPlacementsByFestival(
  festivalId: number,
): Promise<ReservationGamePlacement[]> {
  if (festivalId <= 0) {
    return [];
  }
  const res = await pool.query(
    `SELECT rgp.*
     FROM reservation_game_placements rgp
     JOIN reservations r ON r.id = rgp.reservation_id
     WHERE r.festival_id = $1
     ORDER BY rgp.id`,
    [festivalId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    gameId: row.game_id,
    tablesAllocated: toNumber(row.tables_allocated) ?? 0,
    tableType: row.table_type,
    chairsAllocated: row.chairs_allocated ?? undefined,
    outletsAllocated: row.outlets_allocated ?? undefined,
    mapzoneId: row.mapzone_id ?? null,
  }));
}

export async function getAllPlacements(): Promise<ReservationGamePlacement[]> {
  const res = await pool.query('SELECT * FROM reservation_game_placements ORDER BY id');
  return res.rows.map((row) => ({
    id: row.id,
    reservationId: row.reservation_id,
    gameId: row.game_id,
    tablesAllocated: toNumber(row.tables_allocated) ?? 0,
    tableType: row.table_type,
    chairsAllocated: row.chairs_allocated ?? undefined,
    outletsAllocated: row.outlets_allocated ?? undefined,
    mapzoneId: row.mapzone_id ?? null,
  }));
}

export async function addPlacement(
  placement: Omit<ReservationGamePlacement, 'id'>,
): Promise<ReservationGamePlacement> {
  const validation = await validatePlacement({
    reservationId: placement.reservationId,
    tableType: placement.tableType,
    tablesAllocated: placement.tablesAllocated,
    chairsAllocated: placement.chairsAllocated ?? null,
    outletsAllocated: placement.outletsAllocated ?? null,
    mapzoneId: placement.mapzoneId ?? null,
  });

  if (!validation.ok) {
    throw new Error(validation.error ?? 'Placement invalide');
  }

  const res = await pool.query(
    `INSERT INTO reservation_game_placements
       (reservation_id, game_id, tables_allocated, table_type, chairs_allocated, outlets_allocated, mapzone_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      placement.reservationId,
      placement.gameId,
      placement.tablesAllocated,
      placement.tableType,
      validation.chairsAllocated ?? null,
      placement.outletsAllocated ?? null,
      placement.mapzoneId ?? null,
    ],
  );

  const row = res.rows[0];
  return {
    id: row.id,
    reservationId: row.reservation_id,
    gameId: row.game_id,
    tablesAllocated: toNumber(row.tables_allocated) ?? 0,
    tableType: row.table_type,
    chairsAllocated: row.chairs_allocated ?? undefined,
    outletsAllocated: row.outlets_allocated ?? undefined,
    mapzoneId: row.mapzone_id ?? null,
  };
}

export async function updatePlacement(
  id: number,
  updates: Partial<Omit<ReservationGamePlacement, 'id'>>,
): Promise<ReservationGamePlacement | null> {
  if (id <= 0) {
    return null;
  }

  const existing = await pool.query('SELECT * FROM reservation_game_placements WHERE id = $1', [id]);
  const current = existing.rows[0];
  if (!current) {
    return null;
  }

  const nextReservationId = updates.reservationId ?? current.reservation_id;
  const nextTableType = updates.tableType ?? current.table_type;
  const nextTablesAllocated = updates.tablesAllocated ?? toNumber(current.tables_allocated) ?? 0;
  const nextChairsAllocated = updates.chairsAllocated ?? current.chairs_allocated ?? null;
  const nextOutletsAllocated = updates.outletsAllocated ?? current.outlets_allocated ?? null;
  const nextMapzoneId = updates.mapzoneId !== undefined ? updates.mapzoneId : current.mapzone_id ?? null;

  const validation = await validatePlacement(
    {
      reservationId: nextReservationId,
      tableType: nextTableType,
      tablesAllocated: nextTablesAllocated,
      chairsAllocated: nextChairsAllocated,
      outletsAllocated: nextOutletsAllocated,
      mapzoneId: nextMapzoneId,
    },
    id,
  );

  if (!validation.ok) {
    throw new Error(validation.error ?? 'Placement invalide');
  }

  const res = await pool.query(
    `UPDATE reservation_game_placements
     SET
       reservation_id = COALESCE($1, reservation_id),
       game_id = COALESCE($2, game_id),
       tables_allocated = COALESCE($3, tables_allocated),
       table_type = COALESCE($4, table_type),
       chairs_allocated = COALESCE($5, chairs_allocated),
       outlets_allocated = COALESCE($6, outlets_allocated),
       mapzone_id = COALESCE($7, mapzone_id)
     WHERE id = $8
     RETURNING *`,
    [
      updates.reservationId ?? null,
      updates.gameId ?? null,
      updates.tablesAllocated ?? null,
      updates.tableType ?? null,
      validation.chairsAllocated ?? null,
      updates.outletsAllocated ?? null,
      updates.mapzoneId ?? null,
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
    tablesAllocated: toNumber(row.tables_allocated) ?? 0,
    tableType: row.table_type,
    chairsAllocated: row.chairs_allocated ?? undefined,
    outletsAllocated: row.outlets_allocated ?? undefined,
    mapzoneId: row.mapzone_id ?? null,
  };
}

export async function deletePlacement(id: number): Promise<boolean> {
  if (id <= 0) {
    return false;
  }
  const res = await pool.query('DELETE FROM reservation_game_placements WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}