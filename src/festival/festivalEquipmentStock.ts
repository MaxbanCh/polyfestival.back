import pool from '../database/database';
import type { FestivalEquipmentStock } from '../types/festivalEquipmentStock';

export async function getStocksByFestival(
  festivalId: number,
): Promise<FestivalEquipmentStock[]> {
  if (festivalId <= 0) {
    return [];
  }
  const res = await pool.query(
    'SELECT * FROM festival_equipment_stocks WHERE festival_id = $1 ORDER BY id',
    [festivalId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    festivalId: row.festival_id,
    equipmentId: row.equipment_id,
    quantityAvailable: row.quantity_available,
  }));
}

export async function getAllStocks(): Promise<FestivalEquipmentStock[]> {
  const res = await pool.query(
    'SELECT * FROM festival_equipment_stocks ORDER BY id',
  );
  return res.rows.map((row) => ({
    id: row.id,
    festivalId: row.festival_id,
    equipmentId: row.equipment_id,
    quantityAvailable: row.quantity_available,
  }));
}

export async function addStock(
  stock: Omit<FestivalEquipmentStock, 'id'>,
): Promise<FestivalEquipmentStock> {
  const res = await pool.query(
    `INSERT INTO festival_equipment_stocks (festival_id, equipment_id, quantity_available)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [stock.festivalId, stock.equipmentId, stock.quantityAvailable],
  );
  const row = res.rows[0];
  return {
    id: row.id,
    festivalId: row.festival_id,
    equipmentId: row.equipment_id,
    quantityAvailable: row.quantity_available,
  };
}

export async function updateStock(
  id: number,
  quantityAvailable: number,
): Promise<FestivalEquipmentStock | null> {
  if (id <= 0) {
    return null;
  }
  const res = await pool.query(
    `UPDATE festival_equipment_stocks
     SET quantity_available = COALESCE($1, quantity_available)
     WHERE id = $2
     RETURNING *`,
    [quantityAvailable ?? null, id],
  );
  if (res.rows.length === 0) {
    return null;
  }
  const row = res.rows[0];
  return {
    id: row.id,
    festivalId: row.festival_id,
    equipmentId: row.equipment_id,
    quantityAvailable: row.quantity_available,
  };
}

export async function deleteStock(id: number): Promise<boolean> {
  if (id <= 0) {
    return false;
  }
  const res = await pool.query(
    'DELETE FROM festival_equipment_stocks WHERE id = $1',
    [id],
  );
  return (res.rowCount ?? 0) > 0;
}