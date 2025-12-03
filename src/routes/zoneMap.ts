import { Router } from 'express';
import type { MapZone } from '../types/mapZone';
import { listMapZone, getMapZone, addMapZone, updateMapZone, deleteMapZone } from '../festival/zoneMap';

const zoneMapRouter = Router();

zoneMapRouter.get('/', async (req, res) => {
    const mapZones: MapZone[] = listMapZone();
    res.json(mapZones);
});

zoneMapRouter.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const mapZone: MapZone | null = getMapZone(id);
    if (mapZone) {
        res.json(mapZone);
    } else {
        res.status(404).send('Map zone not found');
    }
});

zoneMapRouter.post('/', async (req, res) => {
    try {
        const newMapZone: Omit<MapZone, "id"> = req.body;
        const retMapZone = addMapZone(newMapZone);
        res.status(201).json(retMapZone);
    } catch (error) {
        res.status(400).send(error instanceof Error ? error.message : 'Invalid request');
    }
});

zoneMapRouter.post('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (id !== req.body.id) {
        res.status(400).send('ID in URL does not match ID in body');
        return;
    }
    const updatedMapZone: MapZone | null = updateMapZone(req.body);
    if (updatedMapZone) {
        res.json(updatedMapZone);
    } else {
        res.status(404).send('Map zone not found');
    }
});

zoneMapRouter.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const success: boolean = deleteMapZone(id);
    if (success) {
        res.status(204).send();
    } else {
        res.status(404).send('Map zone not found');
    }
});

export default zoneMapRouter;