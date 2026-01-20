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

function toFrontActor(actor: Actor) {
  return {
    id: actor.id,
    name: actor.name,
    type: actor.actorType,
    description: actor.description ?? undefined,
    email: actor.email ?? undefined,
    phone: actor.phone ?? undefined,
  };
}

actorRouter.get('/', async (req, res) => {
  const actors: Actor[] = await listActor();
  res.json(actors.map(toFrontActor));
});

actorRouter.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const actor: Actor | null = await getActor(id);
  if (actor) {
    res.json(toFrontActor(actor));
  } else {
    res.status(404).json({ error: 'Actor not found' });
  }
});

actorRouter.post('/', async (req, res) => {
  const body = req.body;
  if (body.actor && body.canReserve) {
    const newActor: Omit<Actor, 'id'> = body.actor;
    const retActor = await addActor(newActor);
    res.status(201).json(toFrontActor(retActor));
  }
  else {
    const actorType = body.actorType || body.type;
    const newActor: Omit<Actor, 'id'> = {
      name: body.name,
      actorType: Array.isArray(actorType) ? actorType : [actorType],
      email: body.email ?? null,
      phone: body.phone ?? null,
      description: body.description ?? null,
    };
    const retActor = await addActor(newActor);
    res.status(201).json(toFrontActor(retActor));
  }

});

actorRouter.post('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id !== req.body.id) {
    res.status(400).json({ error: 'ID in URL does not match ID in body' });
    return;
  }
  const actorType = req.body.actorType || req.body.type;
  const updatedActor: Actor | null = await updateActor({
    id,
    name: req.body.name,
    actorType: Array.isArray(actorType) ? actorType : [actorType],
    email: req.body.email ?? null,
    phone: req.body.phone ?? null,
    description: req.body.description ?? null,
  });
  if (updatedActor) {
    res.json(toFrontActor(updatedActor));
  } else {
    res.status(404).json({ error: 'Actor not found' });
  }
});

actorRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const result = await deleteActor(id);
  if (result.deleted) {
    res.status(204).send();
  } else if (result.reason) {
    res.status(409).json({ error: result.reason });
  } else {
    res.status(404).json({ error: 'Actor not found' });
  }
});

export default actorRouter;
