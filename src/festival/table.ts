import pool from '../database/database';
import { TableType } from '../types/table';
import type Table from '../types/table';

async function addTable(
  festivalId: number,
  type: TableType,
  quantityUsedTable: number,
  quantityMaxTable: number,
): Promise<Table> {
  const res = await pool.query(
    `INSERT INTO tables (festival_id, type, quantityUsedTable, quantityMaxTable)
         VALUES ($1, $2, $3, $4) RETURNING *`,
    [festivalId, type, quantityUsedTable, quantityMaxTable],
  );
  const row = res.rows[0];
  return {
    id: row.id,
    festivalId: row.festival_id,
    type: row.type,
    quantityUsedTable: row.quantity_used_table,
    quantityMaxTable: row.quantity_max_table,
  };
}

function displayTable(table: Table): string {
  return `Id : ${table.id}, Festival ID: ${table.festivalId}, Type: ${table.type}, Used Quantity: ${table.quantityUsedTable}, Max Quantity: ${table.quantityMaxTable}`;
}

async function getTablesforFestival(festivalId: number): Promise<Table[]> {
  if (festivalId <= 0) {
    return [];
  }
  const res = await pool.query(
    'SELECT * FROM tables WHERE festival_id = $1 ORDER BY name;',
    [festivalId],
  );
  return res.rows.map((row) => ({
    id: row.id,
    festivalId: row.festival_id,
    type: row.type,
    quantityUsedTable: row.quantity_used_table,
    quantityMaxTable: row.quantity_max_table,
  }));
}

async function modifyTable(table: Table): Promise<Table | null> {
  const res = await pool.query(
    `UPDATE tables
         SET festival_id = $1, type = $2, quantityUsedTable = $3, quantityMaxTable = $4
         WHERE id = $5 RETURNING *`,
    [
      table.festivalId,
      table.type,
      table.quantityUsedTable,
      table.quantityMaxTable,
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
    quantityUsedTable: row.quantity_used_table,
    quantityMaxTable: row.quantity_max_table,
  };
}

export { addTable, displayTable, getTablesforFestival, modifyTable };
