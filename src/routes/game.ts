import { Router } from 'express';
import type { Game } from '../types/game.ts';
import { listGame, getGame, addGame, updateGame, deleteGame } from '../game/game.ts';

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
    const retGame = addGame(newgame);
    res.status(201).json(retGame);
});

gameRouter.post('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (id !== req.body.id) {
        res.status(400).send('ID in URL does not match ID in body');
        return;
    }
    const updatedGame: Game | null = updateGame(req.body);
    if (updatedGame) {
        res.json(updatedGame);
    } else {
        res.status(404).send('Game not found');
    }
});

gameRouter.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const success: boolean = deleteGame(id);
    if (success) {
        res.status(204).send();
    } else {
        res.status(404).send('Game not found');
    }
});

export default gameRouter;