import { Router } from 'express';
import type { Actor } from '../types/actor';
import {
  listActor,
  getActor,
  addActor,
  updateActor,
  deleteActor,
} from '../actor/actor';

const actorRouter = Router();

actorRouter.get('/', async (req, res) => {
  const actors: Actor[] = await listActor();
  res.json(actors);
});

actorRouter.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const actor: Actor | null = await getActor(id);
  if (actor) {
    res.json(actor);
  } else {
    res.status(404).send('Actor not found');
  }
});

actorRouter.post('/', async (req, res) => {
  const body = req.body;
  const newActor: Omit<Actor, 'id'> = {
    name: body.name,
    actorType: body.actorType || body.type, // Handle both actorType and type
    description: body.description,
  };
  const retActor = await addActor(newActor);
  res.status(201).json(retActor);
});

actorRouter.post('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id !== req.body.id) {
    res.status(400).send('ID in URL does not match ID in body');
    return;
  }
  const updatedActor: Actor | null = await updateActor(req.body);
  if (updatedActor) {
    res.json(updatedActor);
  } else {
    res.status(404).send('Actor not found');
  }
});

actorRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const success: boolean = await deleteActor(id);
  if (success) {
    res.status(204).send();
  } else {
    res.status(404).send('Actor not found');
  }
});

export default actorRouter;
