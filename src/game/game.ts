import { type Game } from '../types/game.ts';
import pool from '../database/database.ts';
import { getActor } from '../actor/actor.ts';
import { ActorType } from '../types/actor.ts';

function displayGame(game: Game): string {
    return `Id : ${game.id},  Game: ${game.name}, Author: ${game.author}, Type: ${game.type}, Ages: ${game.agemin}-${game.agemax}, Description: ${game.description}`;
}

async function getGame(id: number): Promise<Game | null> {
    if (id <= 0) {
        return null;
    }
    const res = await pool.query('SELECT * FROM games WHERE id = $1', [id]);
    if (res.rows.length === 0) {
        return null;
    }
    const row = res.rows[0];
    return {
        id: row.id,
        name: row.name,
        author: row.author,
        type: row.type,
        agemin: row.agemin,
        agemax: row.agemax,
        editorId: row.editor_id,
        description: row.description
    };
}

async function listGame(): Promise<Game[]> {
    const res = await pool.query('SELECT * FROM games ORDER BY name;');
    return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        author: row.author,
        type: row.type,
        agemin: row.agemin,
        agemax: row.agemax,
        editorId: row.editor_id,
        description: row.description
    }));
}

async function addGame(game: Omit<Game, "id">): Promise<Game> {
    const actor = await getActor(game.editorId);
    if (!actor || actor.actorType !== ActorType.EDITOR) {
        throw new Error(`Editor with id ${game.editorId} does not exist or is not an editor`);
    }
    
    const res = await pool.query(
        `INSERT INTO games (name, author, type, agemin, agemax, editor_id, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [game.name, game.author, game.type, game.agemin, game.agemax, game.editorId, game.description]
    );
    const row = res.rows[0];
    return {
        id: row.id,
        name: row.name,
        author: row.author,
        type: row.type,
        agemin: row.agemin,
        agemax: row.agemax,
        editorId: row.editor_id,
        description: row.description
    };
}

async function updateGame(game: Game): Promise<Game | null> {
    const actor = await getActor(game.editorId);
    if (!actor || actor.actorType !== ActorType.EDITOR) {
        throw new Error(`Editor with id ${game.editorId} does not exist or is not an editor`);
    }
    
    const res = await pool.query(
        `UPDATE games
         SET name = $1, author = $2, type = $3, agemin = $4, agemax = $5, editor_id = $6, description = $7
         WHERE id = $8 RETURNING *`,
        [game.name, game.author, game.type, game.agemin, game.agemax, game.editorId, game.description, game.id]
    );
    if (res.rowCount === 0) {
        return null;
    }
    const row = res.rows[0];
    return {
        id: row.id,
        name: row.name,
        author: row.author,
        type: row.type,
        agemin: row.agemin,
        agemax: row.agemax,
        editorId: row.editor_id,
        description: row.description
    };
}

async function deleteGame(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM games WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
}

export {
    displayGame,
    getGame,
    listGame,
    addGame,
    updateGame,
    deleteGame
};