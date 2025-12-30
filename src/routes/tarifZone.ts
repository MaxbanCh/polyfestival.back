import { Router } from 'express';
import type { TarifZone } from '../types/tarifZone';
import { listTarifZone, listTarifZoneByFestival, getTarifZone, addTarifZone, updateTarifZone, deleteTarifZone } from '../festival/tarifZone';

const tarifZoneRouter = Router();

tarifZoneRouter.get('/', async (req, res) => {
    if (req.query.festivalId) {
        const festivalId = parseInt(req.query.festivalId as string, 10);
        const tarifZones: TarifZone[] = (await listTarifZoneByFestival(festivalId));
        res.json(tarifZones);
        return;
    }
    const tarifZones: TarifZone[] = await listTarifZone();
    res.json(tarifZones);
});

tarifZoneRouter.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const tarifZone: TarifZone | null = await getTarifZone(id);
    if (tarifZone) {
        res.json(tarifZone);
    } else {
        res.status(404).send('Tarif zone not found');
    }
});

tarifZoneRouter.post('/', async (req, res) => {
    try {
        const newTarifZone: Omit<TarifZone, "id"> = req.body;
        const retTarifZone = addTarifZone(newTarifZone);
        res.status(201).json(retTarifZone);
    } catch (error) {
        res.status(400).send(error instanceof Error ? error.message : 'Invalid request');
    }
});

tarifZoneRouter.post('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (id !== req.body.id) {
        res.status(400).send('ID in URL does not match ID in body');
        return;
    }
    const updatedTarifZone: TarifZone | null = await updateTarifZone(req.body);
    if (updatedTarifZone) {
        res.json(updatedTarifZone);
    } else {
        res.status(404).send('Tarif zone not found');
    }
});

tarifZoneRouter.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const success: boolean = await deleteTarifZone(id);
    if (success) {
        res.status(204).send();
    } else {
        res.status(404).send('Tarif zone not found');
    }
});

export default tarifZoneRouter;