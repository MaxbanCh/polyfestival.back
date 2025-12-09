import { type Festival } from '../types/festival.ts';
import pool from '../database/database.ts';

// const festivals: Festival[] = [
//     {
//       "id": 1,
//       "name": "PolyFestival 2025",
//       "nbtable": 150,
//       "creationDate": new Date("2025-06-15"),
//       "description": "Annual board game and tabletop gaming festival",
//       "startDate": new Date("2025-11-22"),
//       "endDate": new Date("2025-11-24")
//     },
//     {
//       "id": 2,
//       "name": "PolyFestival 2026",
//       "nbtable": 200,
//       "creationDate": new Date("2026-03-10"),
//       "description": "Annual board game and tabletop gaming festival",
//       "startDate": new Date("2026-07-15"),
//       "endDate": new Date("2026-07-17")
//     }
// ];

function displayFestival(festival: Festival): string {
    return `Id : ${festival.name},  Festival: ${festival.name}, Dates: ${festival.startDate.toDateString()} - ${festival.endDate.toDateString()}`;
}

async function getFestival(id : number): Promise<Festival | null> {
    if (id <= 0) {
        return null;
    }
    const res = await pool.query('SELECT * FROM festivals WHERE id = $1', [id]);
    return res.rows[0] || null;
}

async function listFestivals(): Promise<Festival[]> {
    const res = await pool.query('SELECT * FROM festivals;');
    return res.rows;
}

async function addFestival(festival: Omit<Festival, "id">): Promise<Festival> {
    // const newId = festivals.length > 0 ? Math.max(...festivals.map(f => f.id)) + 1 : 1;
    // const newFestival: Festival = { id: newId, ...festival };
    // festivals.push(newFestival);
    const res = await pool.query(
        `INSERT INTO festivals (name, nbtable, creationDate, description, startDate, endDate)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [festival.name, festival.nbtable, festival.creationDate, festival.description, festival.startDate, festival.endDate]
    );
    const newFestival: Festival = res.rows[0];
    return newFestival;
}

async function updateFestival(festival: Festival): Promise<Festival | null> {
    // const index = festivals.findIndex(f => f.id === festival.id);
    // if (index !== -1) {
    //     festivals[index] = festival;
    //     return festival;
    // }
    // return null;
    const res = await pool.query(
        `UPDATE festivals
         SET name = $1, nbtable = $2, creationDate = $3, description = $4, startDate = $5, endDate = $6
         WHERE id = $7 RETURNING *`,
        [festival.name, festival.nbtable, festival.creationDate, festival.description, festival.startDate, festival.endDate, festival.id]
    );
    if (res.rowCount === 0) {
        return null;
    }
    const updatedFestival: Festival = res.rows[0];
    return updatedFestival;
}

async function deleteFestival(id: number): Promise<boolean> {
    // const index = festivals.findIndex(f => f.id === id);
    // if (index !== -1) {
    //     festivals.splice(index, 1);
    //     return true;
    // }
    // return false;
    const res = await pool.query('DELETE FROM festivals WHERE id = $1', [id]);
    return res !== null;
}

export {
    displayFestival,
    getFestival,
    listFestivals,
    addFestival,
    updateFestival,
    deleteFestival
};