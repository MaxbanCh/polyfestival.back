import { Router } from 'express';
import type Reservation from '../types/reservation.ts';
import {
  addReservation,
  updateReservation,
  listReservations,
  listReservationsByFestival,
  listReservationsByReservant,
} from '../reservation/reservation.ts';

const reservationRouter = Router();

reservationRouter.get('/', async (req, res) => {
  if (req.query.festivalId) {
    const festivalId = parseInt(req.query.festivalId as string, 10);
    const reservations: Reservation[] =
      await listReservationsByFestival(festivalId);
    res.json(reservations);
    return;
  }
  if (req.query.reservantId) {
    const reservantId = parseInt(req.query.reservantId as string, 10);
    const reservations: Reservation[] =
      await listReservationsByReservant(reservantId);
    res.json(reservations);
    return;
  } else {
    const reservations: Reservation[] = await listReservations();
    res.json(reservations);
  }
});

reservationRouter.post('/', async (req, res) => {
  try {
    const newReservation: Omit<Reservation, 'id'> = req.body;
    const retReservation: Reservation = await addReservation(newReservation);
    res.status(201).json(retReservation);
  } catch (error) {
    res
      .status(400)
      .send(error instanceof Error ? error.message : 'Invalid request');
  }
});

reservationRouter.post('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id !== req.body.id) {
    res.status(400).send('ID in URL does not match ID in body');
    return;
  }
  const updatedReservation: Reservation | null = await updateReservation(
    req.body,
  );
  if (updatedReservation) {
    res.json(updatedReservation);
  } else {
    res.status(404).send('Reservation not found');
  }
});

export default reservationRouter;
