import { type Festival } from '../types/festival';
import pool from '../database/database';
import { listTarifZoneByFestival } from './tarifZone';

function displayFestival(festival: Festival): string {
  return `Id : ${festival.name},  Festival: ${festival.name}, Dates: ${festival.startDate.toDateString()} - ${festival.endDate.toDateString()}`;
}

async function getFestival(id: number): Promise<Festival | null> {
  if (id <= 0) {
    return null;
  }
  const res = await pool.query('SELECT * FROM festivals WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function listFestivals(): Promise<Festival[]> {
  const res = await pool.query('SELECT * FROM festivals;');
  console.log(res.rows);
  return res.rows;
}

async function addFestival(festival: Omit<Festival, 'id'>): Promise<Festival> {
  const res = await pool.query(
    `INSERT INTO festivals (name, "creationDate", description, "startDate", "endDate")
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      festival.name,
      festival.creationDate ?? new Date(),
      festival.description ?? '',
      festival.startDate,
      festival.endDate,
    ],
  );
  const newFestival: Festival = res.rows[0];
  console.log('Added festival:', newFestival);
  return newFestival;
}

async function updateFestival(festival: Festival): Promise<Festival | null> {
  const res = await pool.query(
    `UPDATE festivals
         SET name = $1, nbtable = $2, description = $3, "startDate" = $4, "endDate" = $5
         WHERE id = $6 RETURNING *`,
    [
      festival.name,
      festival.description,
      festival.startDate,
      festival.endDate,
      festival.id,
    ],
  );
  if (res.rowCount === 0) {
    return null;
  }
  const updatedFestival: Festival = res.rows[0];
  return updatedFestival;
}

async function deleteFestival(id: number): Promise<boolean> {
  if (await listTarifZoneByFestival(id).then((zones) => zones.length > 0)) {
    throw new Error(`Cannot delete festival with id ${id} because it has associated tarif zones.`);
  }
  if (id <= 0) {
    return false;
  }
  const res = await pool.query('DELETE FROM festivals WHERE id = $1', [id]);
  return res !== null;
}

export {
  displayFestival,
  getFestival,
  listFestivals,
  addFestival,
  updateFestival,
  deleteFestival,
};
