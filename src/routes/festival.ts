import { Router } from 'express';
import type { Festival } from '../types/festival';
import { listFestivals, getFestival, addFestival, updateFestival, deleteFestival } from '../festival/festival';

const festivalRouter = Router();

festivalRouter.get('/', async (req, res) => {
    const festivals: Festival[] = await listFestivals();
    res.json(festivals);
});

festivalRouter.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const festival: Festival | null = await getFestival(id);
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

festivalRouter.post('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (id !== req.body.id) {
        res.status(400).send('ID in URL does not match ID in body');
        return;
    }
    const updatedFestival: Festival | null = await updateFestival(req.body);
    if (updatedFestival) {
        res.json(updatedFestival);
    } else {
        res.status(404).send('Festival not found');
    }
});

festivalRouter.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const success: boolean = await deleteFestival(id);
    if (success) {
        res.status(204).send();
    } else {
        res.status(404).send('Festival not found');
    }
});

export default festivalRouter;