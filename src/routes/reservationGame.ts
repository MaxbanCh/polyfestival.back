import { Router } from 'express';
import type { ReservationGame } from '../types/reservationGame';
import {
  getGamesByReservation,
  getGamesByFestival,
  getAllGames,
  addReservationGame,
  updateReservationGame,
  deleteReservationGame,
} from '../reservation/reservationGame';

const reservationGameRouter = Router();

reservationGameRouter.get('/', async (req, res) => {
  const reservationId = parseInt(req.query.reservationId as string, 10);
  const festivalId = parseInt(req.query.festivalId as string, 10);

  if (Number.isFinite(reservationId)) {
    const games: ReservationGame[] = await getGamesByReservation(reservationId);
    return res.json(games);
  }

  if (Number.isFinite(festivalId)) {
    const games: ReservationGame[] = await getGamesByFestival(festivalId);
    return res.json(games);
  }

  const games: ReservationGame[] = await getAllGames();
  res.json(games);
});

reservationGameRouter.post('/', async (req, res) => {
  const {
    reservationId,
    gameId,
    editorActorId,
    tablesNeeded,
    chairsNeeded,
    outletsNeeded,
  } = req.body ?? {};

  if (!Number.isFinite(reservationId) || !Number.isFinite(gameId)) {
    return res.status(400).json({ error: 'reservationId et gameId requis' });
  }

  const newGame: Omit<ReservationGame, 'id'> = {
    reservationId,
    gameId,
    editorActorId: editorActorId ?? undefined,
    tablesNeeded: tablesNeeded ?? undefined,
    chairsNeeded: chairsNeeded ?? undefined,
    outletsNeeded: outletsNeeded ?? undefined,
  };

  const game: ReservationGame = await addReservationGame(newGame);
  res.status(201).json(game);
});

reservationGameRouter.post('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }

  const {
    reservationId,
    gameId,
    editorActorId,
    tablesNeeded,
    chairsNeeded,
    outletsNeeded,
  } = req.body ?? {};

  const game: ReservationGame | null = await updateReservationGame(id, {
    reservationId,
    gameId,
    editorActorId,
    tablesNeeded,
    chairsNeeded,
    outletsNeeded,
  });

  if (game) {
    res.json(game);
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

reservationGameRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }

  const success: boolean = await deleteReservationGame(id);
  if (success) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

export default reservationGameRouter;
