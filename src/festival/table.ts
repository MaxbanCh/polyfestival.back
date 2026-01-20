import pool from '../database/database';
import { TableType } from '../types/table';
import type Table from '../types/table';

async function addTable(
  festivalId: number,
  type: TableType,
  quantity: number,
): Promise<Table> {
  const res = await pool.query(
    `INSERT INTO tables (festival_id, type, quantity)
         VALUES ($1, $2, $3) RETURNING *`,
    [festivalId, type, quantity],
  );
  const row = res.rows[0];
  return {
    id: row.id,
    festivalId: row.festival_id,
    type: row.type,
    quantity: row.quantity,
  };
}

function displayTable(table: Table): string {
  return `Id : ${table.id}, Festival ID: ${table.festivalId}, Type: ${table.type}, Quantity: ${table.quantity}`;
}

async function getTablesforFestival(festivalId: number): Promise<Table[]> {
  if (festivalId <= 0) {
    return [];
  }
  const res = await pool.query(
    'SELECT * FROM tables WHERE festival_id = $1;',
    [festivalId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    festivalId: row.festival_id,
    type: row.type,
    quantity: row.quantity,
  }));
}

async function modifyTable(table: Table): Promise<Table | null> {
  const res = await pool.query(
    `UPDATE tables
         SET festival_id = $1, type = $2, quantity = $3
         WHERE id = $4 RETURNING *`,
    [
      table.festivalId,
      table.type,
      table.quantity,
      table.id,
    ],
  );
  if (res.rows.length === 0) {
    return null;
  }
  const row = res.rows[0];
  return {
    id: row.id,
    festivalId: row.festival_id,
    type: row.type,
    quantity: row.quantity,
  };
}

export { addTable, displayTable, getTablesforFestival, modifyTable };
