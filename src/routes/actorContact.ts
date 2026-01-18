import { Router } from 'express';
import type { ActorContact } from '../types/actorContact';
import {
  getActorContactbyActor,
  addActorContact,
  updateActorContact,
  deleteActorContact,
} from '../actor/actorContact';

const actorContactRouter = Router();

actorContactRouter.get('/actor/:actorId', async (req, res) => {
  const actorId = parseInt(req.params.actorId, 10);
  const contact: ActorContact | null = await getActorContactbyActor(actorId);
  if (contact) {
    res.json(contact);
  } else {
    res.status(404).send('Actor contact not found');
  }
});

actorContactRouter.post('/', async (req, res) => {
  const body = req.body;
  const newContact: Omit<ActorContact, 'id' | 'created_at' | 'updated_at'> = {
    actorId: body.actorId,
    name: body.name,
    role: body.role,
    email: body.email,
    phone: body.phone,
    notes: body.notes,
  };
  const retContact = await addActorContact(newContact);
  res.status(201).json(retContact);
});

actorContactRouter.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id !== req.body.id) {
    res.status(400).send('ID in URL does not match ID in body');
    return;
  }
  const updatedContact: ActorContact | null = await updateActorContact(req.body);
  if (updatedContact) {
    res.json(updatedContact);
  } else {
    res.status(404).send('Actor contact not found');
  }
});

actorContactRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const success: boolean = await deleteActorContact(id);
  if (success) {
    res.status(204).send();
  } else {
    res.status(404).send('Actor contact not found');
  }
});

export default actorContactRouter;

