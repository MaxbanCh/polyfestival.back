import { Router } from 'express';
import type { ReservationTariffzoneAllocation } from '../types/reservationTariffzoneAllocation';
import {
  getAllocationsByReservation,
  getAllocationsByFestival,
  getAllAllocations,
  addAllocation,
  updateAllocation,
  deleteAllocation,
} from '../reservation/reservationTariffzoneAllocation';

const reservationTariffzoneAllocationRouter = Router();

reservationTariffzoneAllocationRouter.get('/', async (req, res) => {
  const reservationId = parseInt(req.query.reservationId as string, 10);
  const festivalId = parseInt(req.query.festivalId as string, 10);

  if (Number.isFinite(reservationId)) {
    const allocations: ReservationTariffzoneAllocation[] = await getAllocationsByReservation(reservationId);
    return res.json(allocations);
  }

  if (Number.isFinite(festivalId)) {
    const allocations: ReservationTariffzoneAllocation[] = await getAllocationsByFestival(festivalId);
    return res.json(allocations);
  }

  const allocations: ReservationTariffzoneAllocation[] = await getAllAllocations();
  res.json(allocations);
});

reservationTariffzoneAllocationRouter.post('/', async (req, res) => {
  const { reservationId, tariffzoneId, quantityTables, quantityAreaSqm } = req.body ?? {};
  
  if (!Number.isFinite(reservationId) || !Number.isFinite(tariffzoneId)) {
    return res.status(400).json({ error: 'reservationId et tariffzoneId requis' });
  }
  if (!Number.isFinite(quantityTables) && !Number.isFinite(quantityAreaSqm)) {
    return res.status(400).json({ error: 'quantityTables ou quantityAreaSqm requis' });
  }

  try {
    const newAllocation: Omit<ReservationTariffzoneAllocation, 'id'> = {
      reservationId,
      tariffzoneId,
      quantityTables: quantityTables ?? 0,
      quantityAreaSqm: quantityAreaSqm ?? 0,
    };

    const allocation: ReservationTariffzoneAllocation | null = await addAllocation(newAllocation);
    if (allocation) {
      res.status(201).json(allocation);
    } else {
      res.status(400).json({ error: 'Impossible de créer l\'allocation' });
    }
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Erreur lors de la création',
    });
  }
});

reservationTariffzoneAllocationRouter.post('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }

  const { reservationId, tariffzoneId, quantityTables, quantityAreaSqm } = req.body ?? {};

  try {
    const allocation: ReservationTariffzoneAllocation | null = await updateAllocation(id, {
      reservationId,
      tariffzoneId,
      quantityTables,
      quantityAreaSqm,
    });
    
    if (allocation) {
      res.json(allocation);
    } else {
      res.status(404).json({ error: 'Introuvable' });
    }
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    });
  }
});

reservationTariffzoneAllocationRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }

  const success: boolean = await deleteAllocation(id);
  if (success) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

export default reservationTariffzoneAllocationRouter;