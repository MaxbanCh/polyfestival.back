import bcrypt from 'bcryptjs';
import pool from '../database/database';

interface PostgresError extends Error {
  code?: string;
}

function isPostgresError(err: unknown): err is PostgresError {
  return err instanceof Error && 'code' in err;
}

export interface User {
  id: number;
  login: string;
  role: string;
  validated: boolean;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'MANAGE_USERS',
    'ORG_FULL_ACCESS',
    'MANAGE_FESTIVALS',
    'MANAGE_RESERVATIONS',
    'MANAGE_GAMES',
    'MANAGE_EQUIPMENT',
    'MANAGE_TARIFFZONES',
    'VIEW_LIMITED',
    'EDIT_OWN',
    'PUBLIC_VIEW',
  ],
  'super-organisateur': [
    'ORG_FULL_ACCESS',
    'MANAGE_FESTIVALS',
    'MANAGE_RESERVATIONS',
    'MANAGE_GAMES',
    'MANAGE_EQUIPMENT',
    'MANAGE_TARIFFZONES',
    'VIEW_LIMITED',
    'PUBLIC_VIEW',
  ],
  organisateur: [
    'MANAGE_FESTIVALS',
    'MANAGE_RESERVATIONS',
    'MANAGE_GAMES',
    'MANAGE_EQUIPMENT',
    'MANAGE_TARIFFZONES',
    'VIEW_LIMITED',
    'PUBLIC_VIEW',
  ],
  benevole: ['VIEW_LIMITED', 'PUBLIC_VIEW'],
  editeur: ['EDIT_OWN', 'PUBLIC_VIEW'],
  'non-valide': [],
};

export function normalizeRole(role: string): string {
  const normalized = role.trim().toLowerCase();
  return ROLE_PERMISSIONS[normalized] ? normalized : 'benevole';
}

export function toPublicUser(user: User) {
  const role = normalizeRole(user.role);
  return {
    id: user.id,
    login: user.login,
    role,
    validated: user.validated ?? true,
    permissions: ROLE_PERMISSIONS[role] ?? [],
  };
}

export async function findUserByLogin(
  login: string,
): Promise<UserWithPassword | null> {
  const loginInput = login.trim().toLowerCase();
  const loginCandidates = loginInput.includes('@')
    ? [loginInput]
    : [`${loginInput}@gmail.fr`, `${loginInput}@gmail.com`, loginInput];

  const { rows } = await pool.query(
    'SELECT * FROM users WHERE login = ANY($1)',
    [loginCandidates],
  );
  return rows[0] || null;
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(
  login: string,
  password: string,
): Promise<User> {
  const loginInput = login.trim().toLowerCase();
  const hashed = await bcrypt.hash(password, 10);

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (login, password_hash, role, validated)
       VALUES ($1, $2, 'non-valide', FALSE)
       RETURNING id, login, role, validated`,
      [loginInput, hashed],
    );
    return rows[0];
  } catch (err: PostgresError | unknown) {
    if (isPostgresError(err) && err.code === '23505') {
      throw new Error('LOGIN_ALREADY_EXISTS');
    }
    throw err;
  }
}

export async function getUserById(id: number): Promise<User | null> {
  if (id <= 0) {
    return null;
  }
  const { rows } = await pool.query(
    'SELECT id, login, role, validated FROM users WHERE id = $1',
    [id],
  );
  return rows[0] || null;
}

export async function listUsers(): Promise<User[]> {
  const { rows } = await pool.query(
    'SELECT id, login, role, validated FROM users ORDER BY id',
  );
  return rows;
}

export async function validateUser(id: number): Promise<User | null> {
  if (id <= 0) {
    return null;
  }
  const { rows } = await pool.query(
    `UPDATE users
     SET validated = TRUE,
         role = CASE WHEN role = 'non-valide' THEN 'benevole' ELSE role END
     WHERE id = $1
     RETURNING id, login, role, validated`,
    [id],
  );
  return rows[0] || null;
}

export async function updateUserRole(
  id: number,
  role: string,
): Promise<User | null> {
  if (id <= 0) {
    return null;
  }
  const normalizedRole = normalizeRole(role);
  const validated = normalizedRole === 'non-valide' ? false : true;

  const { rows } = await pool.query(
    'UPDATE users SET role = $2, validated = $3 WHERE id = $1 RETURNING id, login, role, validated',
    [id, normalizedRole, validated],
  );
  return rows[0] || null;
}

export async function deleteUser(id: number): Promise<boolean> {
  if (id <= 0) {
    return false;
  }
  const res = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}