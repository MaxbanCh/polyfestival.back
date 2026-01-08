import { type Equipment } from '../types/equipement.ts';
import pool from '../database/database.ts';
import { getFestival } from './festival.ts';

function displayEquipment(equipment: Equipment): string {
  return `Id : ${equipment.id}, Equipment: ${equipment.kind}, Festival ID: ${equipment.festivalId}, Unit Price: ${equipment.unitPrice}, Quantity: ${equipment.quantity}`;
}

async function getEquipment(id: number): Promise<Equipment | null> {
  if (id <= 0) {
    return null;
  }
  const res = await pool.query('SELECT * FROM equipment WHERE id = $1', [id]);
  if (res.rows.length === 0) {
    return null;
  }
  const row = res.rows[0];
  return {
    id: row.id,
    festivalId: row.festival_id,
    kind: row.kind,
    unitPrice: parseFloat(row.unit_price),
    quantity: row.quantity,
  };
}

async function listEquipment(): Promise<Equipment[]> {
  const res = await pool.query(
    'SELECT * FROM equipment ORDER BY festival_id, kind;',
  );
  return res.rows.map((row) => ({
    id: row.id,
    festivalId: row.festival_id,
    kind: row.kind,
    unitPrice: parseFloat(row.unit_price),
    quantity: row.quantity,
  }));
}

async function listEquipmentbyFestival(
  festivalId: number,
): Promise<Equipment[]> {
  const res = await pool.query(
    'SELECT * FROM equipment WHERE festival_id = $1 ORDER BY kind;',
    [festivalId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    festivalId: row.festival_id,
    kind: row.kind,
    unitPrice: parseFloat(row.unit_price),
    quantity: row.quantity,
  }));
}

async function addEquipment(
  equipment: Omit<Equipment, 'id'>,
): Promise<Equipment> {
  const festival = await getFestival(equipment.festivalId);
  if (!festival) {
    throw new Error(`Festival with id ${equipment.festivalId} does not exist`);
  }

  const res = await pool.query(
    `INSERT INTO equipment (festival_id, kind, unit_price, quantity)
         VALUES ($1, $2, $3, $4) RETURNING *`,
    [
      equipment.festivalId,
      equipment.kind,
      equipment.unitPrice,
      equipment.quantity,
    ],
  );
  const row = res.rows[0];
  return {
    id: row.id,
    festivalId: row.festival_id,
    kind: row.kind,
    unitPrice: parseFloat(row.unit_price),
    quantity: row.quantity,
  };
}

async function updateEquipment(
  equipment: Equipment,
): Promise<Equipment | null> {
  const res = await pool.query(
    `UPDATE equipment
         SET festival_id = $1, kind = $2, unit_price = $3, quantity = $4
         WHERE id = $5 RETURNING *`,
    [
      equipment.festivalId,
      equipment.kind,
      equipment.unitPrice,
      equipment.quantity,
      equipment.id,
    ],
  );
  if (res.rowCount === 0) {
    return null;
  }
  const row = res.rows[0];
  return {
    id: row.id,
    festivalId: row.festival_id,
    kind: row.kind,
    unitPrice: parseFloat(row.unit_price),
    quantity: row.quantity,
  };
}

async function deleteEquipment(id: number): Promise<boolean> {
  const res = await pool.query('DELETE FROM equipment WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

export {
  displayEquipment,
  getEquipment,
  listEquipment,
  listEquipmentbyFestival,
  addEquipment,
  updateEquipment,
  deleteEquipment,
};
