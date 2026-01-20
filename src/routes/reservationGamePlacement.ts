import { Router } from 'express';
import type { ReservationGamePlacement } from '../types/reservationGamePlacement';
import {
  getPlacementsByReservation,
  getPlacementsByFestival,
  getAllPlacements,
  addPlacement,
  updatePlacement,
  deletePlacement,
} from '../reservation/reservationGamePlacement';

const reservationGamePlacementRouter = Router();

reservationGamePlacementRouter.get('/', async (req, res) => {
  const reservationId = parseInt(req.query.reservationId as string, 10);
  const festivalId = parseInt(req.query.festivalId as string, 10);

  if (Number.isFinite(reservationId)) {
    const placements: ReservationGamePlacement[] = await getPlacementsByReservation(reservationId);
    return res.json(placements);
  }

  if (Number.isFinite(festivalId)) {
    const placements: ReservationGamePlacement[] = await getPlacementsByFestival(festivalId);
    return res.json(placements);
  }

  const placements: ReservationGamePlacement[] = await getAllPlacements();
  res.json(placements);
});

reservationGamePlacementRouter.post('/', async (req, res) => {
  const {
    reservationId,
    gameId,
    tablesAllocated,
    tableType,
    chairsAllocated,
    outletsAllocated,
    mapzoneId,
  } = req.body ?? {};

  if (!Number.isFinite(reservationId) || !Number.isFinite(gameId) || !tableType) {
    return res.status(400).json({ error: 'reservationId, gameId et tableType requis' });
  }

  try {
    const newPlacement: Omit<ReservationGamePlacement, 'id'> = {
      reservationId,
      gameId,
      tablesAllocated: tablesAllocated ?? 0,
      tableType,
      chairsAllocated: chairsAllocated ?? undefined,
      outletsAllocated: outletsAllocated ?? undefined,
      mapzoneId: mapzoneId ?? null,
    };

    const placement: ReservationGamePlacement = await addPlacement(newPlacement);
    res.status(201).json(placement);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Erreur lors de la création',
    });
  }
});

reservationGamePlacementRouter.post('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }

  const {
    reservationId,
    gameId,
    tablesAllocated,
    tableType,
    chairsAllocated,
    outletsAllocated,
    mapzoneId,
  } = req.body ?? {};

  try {
    const placement: ReservationGamePlacement | null = await updatePlacement(id, {
      reservationId,
      gameId,
      tablesAllocated,
      tableType,
      chairsAllocated,
      outletsAllocated,
      mapzoneId,
    });

    if (placement) {
      res.json(placement);
    } else {
      res.status(404).json({ error: 'Introuvable' });
    }
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    });
  }
});

reservationGamePlacementRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }

  const success: boolean = await deletePlacement(id);
  if (success) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

export default reservationGamePlacementRouter;