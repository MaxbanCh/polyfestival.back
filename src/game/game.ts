import { type Game } from '../types/game.ts';
import pool from '../database/database.ts';
import { getActor } from '../actor/actor.ts';
import { ActorType } from '../types/actor.ts';

function displayGame(game: Game): string {
    return `Id : ${game.id},  Game: ${game.name}, Author: ${game.author}, Type: ${game.type}, Age Min: ${game.ageMin}, Description: ${game.description}`;
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
        ageMin: row.agemin,
        nbMinPlayers: row.nbminplayers,
        nbMaxPlayers: row.nbmaxplayers,
        editorId: row.editor_id,
        description: row.description,
        notice: row.notice,
        prototype: row.prototype,
        duree: row.duree,
        imageUrl: row.imageurl,
        videoRulesUrl: row.videorulesurl
    };
}

async function listGame(): Promise<Game[]> {
    const res = await pool.query('SELECT * FROM games ORDER BY name;');
    return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        author: row.author,
        type: row.type,
        ageMin: row.agemin,
        nbMinPlayers: row.nbminplayers,
        nbMaxPlayers: row.nbmaxplayers,
        editorId: row.editor_id,
        description: row.description,
        notice: row.notice,
        prototype: row.prototype,
        duree: row.duree,
        imageUrl: row.imageurl,
        videoRulesUrl: row.videorulesurl
    }));
}
 
async function addGame(game: Omit<Game, "id">): Promise<Game> {
    const actor = await getActor(game.editorId);
    if (!actor || actor.actorType !== ActorType.EDITOR) {
        throw new Error(`Editor with id ${game.editorId} does not exist or is not an editor`);
    }
    
    const res = await pool.query(
        `INSERT INTO games (name, author, type, agemin, agemax, nbminplayers, nbmaxplayers, editor_id, description, notice, prototype, duree, imageurl, videorulesurl)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
        [game.name, game.author, game.type, game.ageMin, game.ageMin, game.nbMinPlayers, game.nbMaxPlayers, game.editorId, game.description, game.notice, game.prototype, game.duree, game.imageUrl, game.videoRulesUrl]
    );
    const row = res.rows[0];
    return {
        id: row.id,
        name: row.name,
        author: row.author,
        type: row.type,
        ageMin: row.agemin,
        nbMinPlayers: row.nbminplayers,
        nbMaxPlayers: row.nbmaxplayers,
        editorId: row.editor_id,
        description: row.description,
        notice: row.notice,
        prototype: row.prototype,
        duree: row.duree,
        imageUrl: row.imageurl,
        videoRulesUrl: row.videorulesurl
    };
}

async function updateGame(game: Game): Promise<Game | null> {
    const actor = await getActor(game.editorId);
    if (!actor || actor.actorType !== ActorType.EDITOR) {
        throw new Error(`Editor with id ${game.editorId} does not exist or is not an editor`);
    }
    
    const res = await pool.query(
        `UPDATE games
         SET name = $1, author = $2, type = $3, agemin = $4, agemax = $5, nbminplayers = $6, nbmaxplayers = $7, editor_id = $8, description = $9, notice = $10, prototype = $11, duree = $12, imageurl = $13, videorulesurl = $14
         WHERE id = $15 RETURNING *`,
        [game.name, game.author, game.type, game.ageMin, game.ageMin, game.nbMinPlayers, game.nbMaxPlayers, game.editorId, game.description, game.notice, game.prototype, game.duree, game.imageUrl, game.videoRulesUrl, game.id]
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
        ageMin: row.agemin,
        nbMinPlayers: row.nbminplayers,
        nbMaxPlayers: row.nbmaxplayers,
        editorId: row.editor_id,
        description: row.description,
        notice: row.notice,
        prototype: row.prototype,
        duree: row.duree,
        imageUrl: row.imageurl,
        videoRulesUrl: row.videorulesurl
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