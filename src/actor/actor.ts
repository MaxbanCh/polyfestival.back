import { type Actor, ActorType } from '../types/actor.ts';
import pool from '../database/database.ts';

function displayActor(actor: Actor): string {
    return `Id : ${actor.id},  Actor: ${actor.name}, Type: ${actor.actorType}, Description: ${actor.description}`;
}

async function getActor(id: number): Promise<Actor | null> {
    if (id <= 0) {
        return null;
    }
    const res = await pool.query('SELECT * FROM actors WHERE id = $1', [id]);
    if (res.rows.length === 0) {
        return null;
    }
    const row = res.rows[0];
    return {
        id: row.id,
        name: row.name,
        actorType: row.actor_type as ActorType,
        description: row.description
    };
}

async function listActor(): Promise<Actor[]> {
    const res = await pool.query('SELECT * FROM actors ORDER BY name;');
    return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        actorType: row.actor_type as ActorType,
        description: row.description
    }));
}

async function addActor(actor: Omit<Actor, "id">): Promise<Actor> {
    const res = await pool.query(
        `INSERT INTO actors (name, actor_type, description)
         VALUES ($1, $2, $3) RETURNING *`,
        [actor.name, actor.actorType, actor.description]
    );
    const row = res.rows[0];
    return {
        id: row.id,
        name: row.name,
        actorType: row.actor_type as ActorType,
        description: row.description
    };
}

async function updateActor(actor: Actor): Promise<Actor | null> {
    const res = await pool.query(
        `UPDATE actors
         SET name = $1, actor_type = $2, description = $3
         WHERE id = $4 RETURNING *`,
        [actor.name, actor.actorType, actor.description, actor.id]
    );
    if (res.rowCount === 0) {
        return null;
    }
    const row = res.rows[0];
    return {
        id: row.id,
        name: row.name,
        actorType: row.actor_type as ActorType,
        description: row.description
    };
}

async function deleteActor(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM actors WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
}

export {
    displayActor,
    getActor,
    listActor,
    addActor,
    updateActor,
    deleteActor
};