import { Router } from 'express';
import type { Game } from '../types/game.ts';
import { listGame, getGame, addGame } from '../game/game.ts';

const gameRouter = Router();

gameRouter.get('/', async (req, res) => {
    const games: Game[] = listGame();
    res.json(games);
});

gameRouter.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const game: Game | null = getGame(id);
    if (game) {
        res.json(game);
    } else {
        res.status(404).send('Game not found');
    }
});

gameRouter.post('/', async (req, res) => {
    const newgame: Game = req.body;
    addGame(newgame);
    res.status(201).json(newgame);
});

export default gameRouter;