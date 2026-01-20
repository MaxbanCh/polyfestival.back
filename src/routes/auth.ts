import { Router } from 'express';
import {
  verifyToken,
  createAccessToken,
  createRefreshToken,
} from '../middleware/token-management';
import { requireAdmin } from '../middleware/auth-admin';
import {
  COOKIE_SAMESITE,
  COOKIE_SECURE,
  JWT_SECRET,
} from '../config/env';
import type { TokenPayload } from '../types/token-payload';
import { ensureAdmin, ensureDefaultUsers } from '../database/initAdmin';
import {
  findUserByLogin,
  verifyPassword,
  createUser,
  getUserById,
  listUsers,
  validateUser,
  updateUserRole,
  deleteUser,
  toPublicUser,
  normalizeRole,
} from '../user/auth';
import jwt from 'jsonwebtoken';

const router = Router();

const cookieSecure = COOKIE_SECURE;
const cookieSameSite = COOKIE_SAMESITE;

// --- LOGIN ---
router.post('/login', async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ error: 'Identifiants manquants' });
  }

  try {
    const user = await findUserByLogin(login);
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur inconnu' });
    }

    const match = await verifyPassword(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    const role = normalizeRole(user.role);
    const accessToken = createAccessToken({ id: user.id, role });
    const refreshToken = createRefreshToken({ id: user.id, role });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Authentification réussie',
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- LOGOUT ---
router.post('/logout', (_req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ message: 'Déconnexion réussie' });
});

// --- ME ---
router.get('/me', verifyToken, async (req, res) => {
  const id = req.user?.id;
  if (!id) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }

  const user = await getUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  res.json({
    message: 'Utilisateur authentifié',
    user: toPublicUser(user),
  });
});

// --- REGISTER ---
router.post('/register', async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    const user = await createUser(login, password);
    res.status(201).json({
      message: 'Utilisateur créé',
      user: toPublicUser(user),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'LOGIN_ALREADY_EXISTS') {
      return res.status(409).json({ error: 'Login déjà utilisé' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Liste des utilisateurs (admin seulement)
router.get('/', verifyToken, requireAdmin, async (_req, res) => {
  const users = await listUsers();
  res.json(users.map(toPublicUser));
});

// Valider un utilisateur (admin)
router.post('/:id/validate', verifyToken, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }

  const user = await validateUser(id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  res.json(toPublicUser(user));
});

// Changer le role d'un utilisateur (admin)
router.post('/:id/role', verifyToken, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }

  const roleInput = typeof req.body?.role === 'string' ? req.body.role : '';
  const user = await updateUserRole(id, roleInput);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  res.json(toPublicUser(user));
});

// Refuser un utilisateur (admin)
router.post('/:id/refuse', verifyToken, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }

  const success = await deleteUser(id);
  if (success) {
    res.status(204).end();
  } else {
    res.status(404).json({ error: 'Utilisateur introuvable' });
  }
});

// WhoAmI
router.get('/whoami', verifyToken, async (req, res) => {
  const id = req.user?.id;
  if (!id) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }

  const user = await getUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  res.json({ user: toPublicUser(user) });
});

// Refresh token
router.post('/refresh', (req, res) => {
  const refresh = req.cookies?.refresh_token;
  if (!refresh) {
    return res.status(401).json({ error: 'Refresh token manquant' });
  }

  try {
    const decoded = jwt.verify(refresh, JWT_SECRET) as TokenPayload;
    const role = normalizeRole(decoded.role);
    const newAccess = createAccessToken({ id: decoded.id, role });

    res.cookie('access_token', newAccess, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: 'Token renouvelé' });
  } catch {
    res.status(403).json({ error: 'Refresh token invalide ou expiré' });
  }
});

// Init admin
router.get('/initadmin', async (_req, res) => {
  try {
    await ensureAdmin();
    await ensureDefaultUsers();
    res.json({ message: 'Comptes par défaut vérifiés ou créés' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur serveur' });
  }
});

export default router;
