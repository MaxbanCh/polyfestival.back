import { Router } from 'express';
import type Reservation from '../types/reservation';
import { ReservationStatus } from '../types/reservation';
import {
  addReservation,
  updateReservation,
  listReservations,
  listReservationsByFestival,
  listReservationsByReservant,
  deleteReservation,
} from '../reservation/reservation';

const reservationRouter = Router();

const STATUS_VALUES = [
  ReservationStatus.NOT_CONTACTED,
  ReservationStatus.CONTACTED,
  ReservationStatus.DISCUSSION,
  ReservationStatus.WILL_BE_ABSENT,
  ReservationStatus.CONSIDERED_ABSENT,
  ReservationStatus.CONFIRMED,
  ReservationStatus.INVOICED,
  ReservationStatus.PAID,
];

function normalizeStatus(status: unknown): ReservationStatus {
  if (typeof status === 'string' && STATUS_VALUES.includes(status as ReservationStatus)) {
    return status as ReservationStatus;
  }
  if (typeof status === 'number' && Number.isFinite(status) && STATUS_VALUES[status]) {
    return STATUS_VALUES[status];
  }
  return ReservationStatus.NOT_CONTACTED;
}

function statusToIndex(status: ReservationStatus): number {
  const idx = STATUS_VALUES.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function toFrontendReservation(reservation: Reservation) {
  return {
    ...reservation,
    status: statusToIndex(reservation.status),
  };
}

reservationRouter.get('/', async (req, res) => {
  if (req.query.festivalId) {
    const festivalId = parseInt(req.query.festivalId as string, 10);
    const reservations: Reservation[] =
      await listReservationsByFestival(festivalId);
    res.json(reservations.map(toFrontendReservation));
    return;
  }
  if (req.query.reservantId) {
    const reservantId = parseInt(req.query.reservantId as string, 10);
    const reservations: Reservation[] =
      await listReservationsByReservant(reservantId);
    res.json(reservations.map(toFrontendReservation));
    return;
  } else {
    const reservations: Reservation[] = await listReservations();
    res.json(reservations.map(toFrontendReservation));
  }
});

reservationRouter.post('/', async (req, res) => {
  try {
    const body = req.body ?? {};
    const newReservation: Omit<Reservation, 'id'> = {
      festivalId: body.festivalId,
      reservantId: body.reservantId,
      status: normalizeStatus(body.status),
      priceBeforeDiscount: body.priceBeforeDiscount ?? null,
      discountAmount: body.discountAmount ?? null,
      totalPrice: body.totalPrice ?? null,
      freeTables: body.freeTables ?? null,
      presentsGames: body.presentsGames ?? false,
      gamesListRequested: body.gamesListRequested ?? false,
      gamesListReceived: body.gamesListReceived ?? false,
      gamesReceived: body.gamesReceived ?? false,
    };
    const retReservation: Reservation = await addReservation(newReservation);
    res.status(201).json(toFrontendReservation(retReservation));
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Invalid request',
    });
  }
});

reservationRouter.post('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id !== req.body.id) {
    return res.status(400).json({ error: 'ID in URL does not match ID in body' });
  }
  const body = req.body ?? {};
  const updatedReservation: Reservation | null = await updateReservation({
    id,
    festivalId: body.festivalId,
    reservantId: body.reservantId,
    status: normalizeStatus(body.status),
    priceBeforeDiscount: body.priceBeforeDiscount ?? null,
    discountAmount: body.discountAmount ?? null,
    totalPrice: body.totalPrice ?? null,
    freeTables: body.freeTables ?? null,
    presentsGames: body.presentsGames ?? false,
    gamesListRequested: body.gamesListRequested ?? false,
    gamesListReceived: body.gamesListReceived ?? false,
    gamesReceived: body.gamesReceived ?? false,
  });
  if (updatedReservation) {
    res.json(toFrontendReservation(updatedReservation));
  } else {
    res.status(404).json({ error: 'Reservation not found' });
  }
});

reservationRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }
  const success: boolean = await deleteReservation(id);
  if (success) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Reservation not found' });
  }
});

export default reservationRouter;
