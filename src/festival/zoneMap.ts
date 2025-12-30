import { type MapZone } from '../types/mapZone.ts';
import pool from '../database/database.ts';
import { getFestival } from './festival.ts';

function displayMapZone(mapZone: MapZone): string {
    return `Id : ${mapZone.id},  MapZone: ${mapZone.name}, Description: ${mapZone.description}, Tables: ${mapZone.nbtable}, Tariff Zone ID: ${mapZone.tariffzoneid}, Festival ID: ${mapZone.festivalId}`;
}

async function getMapZone(id: number): Promise<MapZone | null> {
    if (id <= 0) {
        return null;
    }
    const res = await pool.query('SELECT * FROM map_zones WHERE id = $1', [id]);
    if (res.rows.length === 0) {
        return null;
    }
    const row = res.rows[0];
    return {
        id: row.id,
        name: row.name,
        festivalId: row.festival_id,
        nbtable: row.nbtable,
        tariffzoneid: row.tariffzoneid,
        description: row.description
    };
}

async function listMapZone(): Promise<MapZone[]> {
    const res = await pool.query('SELECT * FROM map_zones ORDER BY festival_id, name;');
    return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        festivalId: row.festival_id,
        nbtable: row.nbtable,
        tariffzoneid: row.tariffzoneid,
        description: row.description
    }));
}

async function listMapZoneByFestival(festivalId: number): Promise<MapZone[]> {
    if (festivalId <= 0) {
        return [];
    }
    const res = await pool.query('SELECT * FROM map_zones WHERE festival_id = $1 ORDER BY name;', [festivalId]);
    return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        festivalId: row.festival_id,
        nbtable: row.nbtable,
        tariffzoneid: row.tariffzoneid,
        description: row.description
    }));
}

async function listMapZoneByTarifZone(tarifZoneId: number): Promise<MapZone[]> {
    if (tarifZoneId <= 0) {
        return [];
    }
    const res = await pool.query('SELECT * FROM map_zones WHERE tariffzoneid = $1 ORDER BY name;', [tarifZoneId]);
    return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        festivalId: row.festival_id,
        nbtable: row.nbtable,
        tariffzoneid: row.tariffzoneid,
        description: row.description
    }));
}

async function addMapZone(mapZone: Omit<MapZone, "id">): Promise<MapZone> {
    const festival = await getFestival(mapZone.festivalId);
    if (!festival) {
        throw new Error(`Festival with id ${mapZone.festivalId} does not exist`);
    }
    
    const res = await pool.query(
        `INSERT INTO map_zones (name, festival_id, nbtable, tariffzoneid, description)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [mapZone.name, mapZone.festivalId, mapZone.nbtable, mapZone.tariffzoneid, mapZone.description]
    );
    const row = res.rows[0];
    return {
        id: row.id,
        name: row.name,
        festivalId: row.festival_id,
        nbtable: row.nbtable,
        tariffzoneid: row.tariffzoneid,
        description: row.description
    };
}

async function updateMapZone(mapZone: MapZone): Promise<MapZone | null> {
    const res = await pool.query(
        `UPDATE map_zones
         SET name = $1, festival_id = $2, nbtable = $3, tariffzoneid = $4, description = $5
         WHERE id = $6 RETURNING *`,
        [mapZone.name, mapZone.festivalId, mapZone.nbtable, mapZone.tariffzoneid, mapZone.description, mapZone.id]
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
        tariffzoneid: row.tariffzoneid,
        description: row.description
    };
}

async function deleteMapZone(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM map_zones WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
}

export {
    displayMapZone,
    getMapZone,
    listMapZone,
    listMapZoneByFestival,
    listMapZoneByTarifZone,
    addMapZone,
    updateMapZone,
    deleteMapZone
};