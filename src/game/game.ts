import { type Game } from '../types/game.ts';
import { getActor } from '../actor/actor.ts';
import { ActorType } from '../types/actor.ts';

const games: Game[] = [
    {
      "id": 1,
      "name": "Dekal",
      "author": "C. Fiorio",
      "agemin": 8,
      "agemax": 99,
      "type": "Card Game",
      "description": "A super game for piscine",
      "editorId": 1
    },
    {
      "id": 2,
      "name": "7 wonders",
      "author": "C. Fiorio",
      "agemin": 12,
      "agemax": 99,
      "type": "Strategy Game",
      "description": "Build your wonder and conquer the world",
      "editorId": 2
    }
];

function displayGame(game : Game): string {
    return `Id : ${game.name},  Game: ${game.name}, Author: ${game.author}, Type: ${game.type}, Ages: ${game.agemin}-${game.agemax}, Description: ${game.description}`;
}

function getGame(id : number): Game | null {
    return games.find(game => game.id === id) || null;
}

function listGame(): Game[] {
    return games;
}

function addGame(game: Omit<Game, "id">): Game {
    const newId = games.length > 0 ? Math.max(...games.map(g => g.id)) + 1 : 1;
    const actorId = game.editorId;
    if (!getActor(actorId) || getActor(actorId)?.actorType !== ActorType.EDITOR) {
        throw new Error(`Editor with id ${actorId} does not exist or is not an editor`);
    }
    const newGame: Game = { id: newId, ...game };
    games.push(newGame);
    return newGame;
}

function updateGame(game: Game): Game | null {
    const actorId = game.editorId;
    if (!getActor(actorId) || getActor(actorId)?.actorType !== ActorType.EDITOR) {
        throw new Error(`Editor with id ${actorId} does not exist or is not an editor`);
    }
    
    const index = games.findIndex(g => g.id === game.id);
    if (index !== -1) {
        games[index] = game;
        return game;
    }
    return null;
}

function deleteGame(id: number): boolean {
    const index = games.findIndex(g => g.id === id);
    if (index !== -1) {
        games.splice(index, 1);
        return true;
    }
    return false;
}

export {
    displayGame,
    getGame,
    listGame,
    addGame,
    updateGame,
    deleteGame
};