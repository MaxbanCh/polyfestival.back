import { Router } from 'express';
import type { Festival } from '../types/festival';
import { listFestivals, getFestival, addFestival } from '../festival/festival';

const festivalRouter = Router();

festivalRouter.get('/', async (req, res) => {
    const festivals: Festival[] = listFestivals();
    res.json(festivals);
});

festivalRouter.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const festival: Festival | null = getFestival(id);
    if (festival) {
        res.json(festival);
    } else {
        res.status(404).send('Festival not found');
    }
});

festivalRouter.post('/', async (req, res) => {
    const newFestival: Festival = req.body;
    const retFestival = addFestival(newFestival);
    res.status(201).json(retFestival);
});

export default festivalRouter;