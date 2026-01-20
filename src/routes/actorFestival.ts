import { Router } from 'express';
import type { ActorFestival } from '../types/actorFestival';
import { ReservationStatus } from '../types/reservation';
import {
  getActorFestivalsByFestival,
  getAllActorFestivals,
  addActorToFestival,
  deleteActorFromFestival,
  markActorAsContacted,
  updateActorFestivalStatus,
} from '../festival/actorFestival';

const actorFestivalRouter = Router();

actorFestivalRouter.get('/', async (req, res) => {
  const festivals: ActorFestival[] = await getAllActorFestivals();
  res.json(festivals);
});

actorFestivalRouter.get('/:festivalId/actors/links', async (req, res) => {
  const festivalId = parseInt(req.params.festivalId, 10);
  if (!Number.isFinite(festivalId)) {
    return res.status(400).json({ error: 'festivalId invalide' });
  }
  const festivals: ActorFestival[] = await getActorFestivalsByFestival(festivalId);
  res.json(festivals);
});

actorFestivalRouter.post('/:festivalId/actors', async (req, res) => {
  const festivalId = parseInt(req.params.festivalId, 10);
  const actorId = parseInt(req.body?.actorId, 10);
  if (!Number.isFinite(festivalId) || !Number.isFinite(actorId)) {
    return res.status(400).json({ error: 'festivalId et actorId requis' });
  }
  const result: ActorFestival | null = await addActorToFestival(festivalId, actorId);
  if (result) {
    res.status(201).json(result);
  } else {
    res.status(400).json({ error: 'Impossible d\'ajouter l\'acteur au festival' });
  }
});

actorFestivalRouter.delete('/:festivalId/actors/:actorId', async (req, res) => {
  const festivalId = parseInt(req.params.festivalId, 10);
  const actorId = parseInt(req.params.actorId, 10);
  if (!Number.isFinite(festivalId) || !Number.isFinite(actorId)) {
    return res.status(400).json({ error: 'festivalId et actorId requis' });
  }
  const success: boolean = await deleteActorFromFestival(festivalId, actorId);
  if (success) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

actorFestivalRouter.post('/:festivalId/actors/:actorId/contact', async (req, res) => {
  const festivalId = parseInt(req.params.festivalId, 10);
  const actorId = parseInt(req.params.actorId, 10);
  if (!Number.isFinite(festivalId) || !Number.isFinite(actorId)) {
    return res.status(400).json({ error: 'festivalId et actorId requis' });
  }
  const result: ActorFestival | null = await markActorAsContacted(festivalId, actorId);
  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

actorFestivalRouter.post('/:festivalId/actors/:actorId/status', async (req, res) => {
  const festivalId = parseInt(req.params.festivalId, 10);
  const actorId = parseInt(req.params.actorId, 10);
  const { status } = req.body ?? {};
  if (!Number.isFinite(festivalId) || !Number.isFinite(actorId)) {
    return res.status(400).json({ error: 'festivalId et actorId requis' });
  }
  if (status === undefined || status === null) {
    return res.status(400).json({ error: 'status requis' });
  }
  const result: ActorFestival | null = await updateActorFestivalStatus(
    festivalId,
    actorId,
    status as ReservationStatus,
  );
  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

actorFestivalRouter.patch('/:festivalId/actors/:actorId/status', async (req, res) => {
  const festivalId = parseInt(req.params.festivalId, 10);
  const actorId = parseInt(req.params.actorId, 10);
  const { status } = req.body ?? {};
  if (!Number.isFinite(festivalId) || !Number.isFinite(actorId)) {
    return res.status(400).json({ error: 'festivalId et actorId requis' });
  }
  if (status === undefined || status === null) {
    return res.status(400).json({ error: 'status requis' });
  }
  const result: ActorFestival | null = await updateActorFestivalStatus(
    festivalId,
    actorId,
    status as ReservationStatus,
  );
  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

export default actorFestivalRouter;