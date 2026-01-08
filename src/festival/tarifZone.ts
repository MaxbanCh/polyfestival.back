import { type TarifZone } from '../types/tarifZone.ts';
import pool from '../database/database.ts';
import { getFestival } from './festival.ts';

function displayTarifZone(tarifZone: TarifZone): string {
  return `Id : ${tarifZone.id},  TarifZone: ${tarifZone.name}, Tables: ${tarifZone.nbtable}, Festival ID: ${tarifZone.festivalId}`;
}

async function getTarifZone(id: number): Promise<TarifZone | null> {
  if (id <= 0) {
    return null;
  }
  const res = await pool.query('SELECT * FROM tarif_zones WHERE id = $1', [id]);
  if (res.rows.length === 0) {
    return null;
  }
  const row = res.rows[0];
  return {
    id: row.id,
    name: row.name,
    festivalId: row.festival_id,
    nbtable: row.nbtable,
    tableprice: parseFloat(row.tableprice),
    pricem2: parseFloat(row.pricem2),
    availableTables: row.available_tables,
  };
}

async function listTarifZone(): Promise<TarifZone[]> {
  const res = await pool.query(
    'SELECT * FROM tarif_zones ORDER BY festival_id, name;',
  );
  return res.rows.map((row) => ({
    id: row.id,
    name: row.name,
    festivalId: row.festival_id,
    nbtable: row.nbtable,
    tableprice: parseFloat(row.tableprice),
    pricem2: parseFloat(row.pricem2),
    availableTables: row.available_tables,
  }));
}

async function listTarifZoneByFestival(
  festivalId: number,
): Promise<TarifZone[]> {
  if (festivalId <= 0) {
    return [];
  }
  const res = await pool.query(
    'SELECT * FROM tarif_zones WHERE festival_id = $1 ORDER BY name;',
    [festivalId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    name: row.name,
    festivalId: row.festival_id,
    nbtable: row.nbtable,
    tableprice: parseFloat(row.tableprice),
    pricem2: parseFloat(row.pricem2),
    availableTables: row.available_tables,
  }));
}

async function addTarifZone(
  tarifZone: Omit<TarifZone, 'id'>,
): Promise<TarifZone> {
  if (tarifZone.availableTables > tarifZone.nbtable) {
    tarifZone.availableTables = tarifZone.nbtable;
  }

  const festival = await getFestival(tarifZone.festivalId);
  if (!festival) {
    throw new Error(`Festival with id ${tarifZone.festivalId} does not exist`);
  }

  const res = await pool.query(
    `INSERT INTO tarif_zones (name, festival_id, nbtable, tableprice, pricem2, available_tables)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      tarifZone.name,
      tarifZone.festivalId,
      tarifZone.nbtable,
      tarifZone.tableprice,
      tarifZone.pricem2,
      tarifZone.availableTables,
    ],
  );
  const row = res.rows[0];
  return {
    id: row.id,
    name: row.name,
    festivalId: row.festival_id,
    nbtable: row.nbtable,
    tableprice: parseFloat(row.tableprice),
    pricem2: parseFloat(row.pricem2),
    availableTables: row.available_tables,
  };
}

async function updateTarifZone(
  tarifZone: TarifZone,
): Promise<TarifZone | null> {
  const res = await pool.query(
    `UPDATE tarif_zones
         SET name = $1, festival_id = $2, nbtable = $3, tableprice = $4, pricem2 = $5, available_tables = $6
         WHERE id = $7 RETURNING *`,
    [
      tarifZone.name,
      tarifZone.festivalId,
      tarifZone.nbtable,
      tarifZone.tableprice,
      tarifZone.pricem2,
      tarifZone.availableTables,
      tarifZone.id,
    ],
  );
  if (res.rowCount === 0) {
    return null;
  }
  const row = res.rows[0];
  return {
    id: row.id,
    name: row.name,
    festivalId: row.festival_id,
    nbtable: row.nbtable,
    tableprice: parseFloat(row.tableprice),
    pricem2: parseFloat(row.pricem2),
    availableTables: row.available_tables,
  };
}

async function deleteTarifZone(id: number): Promise<boolean> {
  const res = await pool.query('DELETE FROM tarif_zones WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

export {
  displayTarifZone,
  getTarifZone,
  listTarifZone,
  listTarifZoneByFestival,
  addTarifZone,
  updateTarifZone,
  deleteTarifZone,
};
