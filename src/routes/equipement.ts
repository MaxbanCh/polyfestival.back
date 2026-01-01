import { Router } from 'express';
import type { Equipment } from '../types/equipement';
import { addEquipment, updateEquipment, getEquipment, listEquipment, listEquipmentbyFestival } from '../festival/equipement';

const equipmentRouter = Router();

equipmentRouter.get('/', async (req, res) => {
    if (req.query.festivalId) {
        const festivalId = parseInt(req.query.festivalId as string, 10);
        const equipments: Equipment[] = await listEquipmentbyFestival(festivalId);
        res.json(equipments);
        return;
    }
});

equipmentRouter.post('/', async (req, res) => {
    try {
        const newEquipment: Omit<Equipment, "id"> = req.body;
        const retEquipment: Equipment = await addEquipment(newEquipment);
        res.status(201).json(retEquipment);
    } catch (error) {
        res.status(400).send(error instanceof Error ? error.message : 'Invalid request');
    }
});

equipmentRouter.post('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (id !== req.body.id) {
        res.status(400).send('ID in URL does not match ID in body');
        return;
    }
    const updatedEquipment: Equipment | null = await updateEquipment(req.body);
    if (updatedEquipment) {
        res.json(updatedEquipment);
    }
    else {
        res.status(404).send('Equipment not found');
    }
});

export default equipmentRouter;