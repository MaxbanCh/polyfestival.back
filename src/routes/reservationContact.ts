import { Router } from 'express';
import type { ReservationContact } from '../types/reservationContact';
import {
  getContactsByReservation,
  getContactsByFestival,
  getAllContacts,
  addReservationContact,
  updateReservationContact,
  deleteReservationContact,
} from '../reservation/reservationContact';

const reservationContactRouter = Router();

reservationContactRouter.get('/', async (req, res) => {
  const reservationId = parseInt(req.query.reservationId as string, 10);
  const festivalId = parseInt(req.query.festivalId as string, 10);

  if (Number.isFinite(reservationId)) {
    const contacts: ReservationContact[] = await getContactsByReservation(reservationId);
    return res.json(contacts);
  }

  if (Number.isFinite(festivalId)) {
    const contacts: ReservationContact[] = await getContactsByFestival(festivalId);
    return res.json(contacts);
  }

  const contacts: ReservationContact[] = await getAllContacts();
  res.json(contacts);
});

reservationContactRouter.post('/', async (req, res) => {
  const { reservationId, contactId, contactDate, notes, createdAt, updatedAt } = req.body ?? {};
  if (!Number.isFinite(reservationId)) {
    return res.status(400).json({ error: 'reservationId requis' });
  }

  const newContact: Omit<ReservationContact, 'id'> = {
    reservationId,
    contactId: contactId ?? null,
    contactDate: contactDate ?? null,
    notes: notes ?? null,
    createdAt: createdAt ?? null,
    updatedAt: updatedAt ?? null,
  };

  const contact: ReservationContact = await addReservationContact(newContact);
  res.status(201).json(contact);
});

reservationContactRouter.post('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }
  const { contactId, contactDate, notes, updatedAt } = req.body ?? {};

  const contact: ReservationContact | null = await updateReservationContact(id, {
    contactId,
    contactDate,
    notes,
    updatedAt,
  });
  if (contact) {
    res.json(contact);
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

reservationContactRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }
  const success: boolean = await deleteReservationContact(id);
  if (success) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

export default reservationContactRouter;