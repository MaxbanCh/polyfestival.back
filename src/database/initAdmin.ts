import pool from './database';
import bcrypt from 'bcryptjs';

export async function ensureAdmin(): Promise<void> {
  const hash = await bcrypt.hash('admin', 10);
  try {
    await pool.query(
      `INSERT INTO users (login, password_hash, role)
        VALUES ('admin@axithem.fr', $1, 'admin')
        ON CONFLICT (login) DO NOTHING`,
      [hash],
    );
  } catch (error) {
    console.error('Erreur lors de la création du compte admin :', error);
    throw error;
  }

  console.log('👍 Compte admin vérifié ou créé');
}
