import { Router } from 'express';
import type { ReservationNote } from '../types/reservationNote';
import {
  getNotesByReservation,
  getNotesByFestival,
  getAllNotes,
  addReservationNote,
  updateReservationNote,
  deleteReservationNote,
} from '../reservation/reservationNote';

const reservationNoteRouter = Router();

reservationNoteRouter.get('/', async (req, res) => {
  const reservationId = parseInt(req.query.reservationId as string, 10);
  const festivalId = parseInt(req.query.festivalId as string, 10);

  if (Number.isFinite(reservationId)) {
    const notes: ReservationNote[] = await getNotesByReservation(reservationId);
    return res.json(notes);
  }

  if (Number.isFinite(festivalId)) {
    const notes: ReservationNote[] = await getNotesByFestival(festivalId);
    return res.json(notes);
  }

  const notes: ReservationNote[] = await getAllNotes();
  res.json(notes);
});

reservationNoteRouter.post('/', async (req, res) => {
  const { reservationId, contactId, author, content, createdAt } = req.body ?? {};
  if (!Number.isFinite(reservationId)) {
    return res.status(400).json({ error: 'reservationId requis' });
  }
  if (!content) {
    return res.status(400).json({ error: 'content requis' });
  }

  const newNote: Omit<ReservationNote, 'id'> = {
    reservationId,
    contactId: Number.isFinite(contactId) ? contactId : null,
    author: author ?? null,
    content,
    createdAt: createdAt ?? null,
  };

  const note: ReservationNote = await addReservationNote(newNote);
  res.status(201).json(note);
});

reservationNoteRouter.post('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }
  const { author, content, contactId } = req.body ?? {};

  const note: ReservationNote | null = await updateReservationNote(id, {
    author,
    content,
    contactId: Number.isFinite(contactId) ? contactId : null,
  });
  if (note) {
    res.json(note);
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

reservationNoteRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }
  const success: boolean = await deleteReservationNote(id);
  if (success) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

export default reservationNoteRouter;