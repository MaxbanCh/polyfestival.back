import pool from './database';
import bcrypt from 'bcryptjs';

export async function ensureAdmin(): Promise<void> {
  const hash = await bcrypt.hash('admin', 10);
  try {
    await pool.query(
      `INSERT INTO users (login, password_hash, role, validated)
        VALUES ('admin@axithem.fr', $1, 'admin', true)
        ON CONFLICT (login) DO NOTHING`,
      [hash],
    );
  } catch (error) {
    console.error('Erreur lors de la création du compte admin :', error);
    throw error;
  }

  console.log('👍 Compte admin vérifié ou créé');
}

export async function ensureDefaultUsers(): Promise<void> {
    const defaultUsers = [
        { login: 'admin@axithem.fr', role: 'admin', password: 'admin', validated: true },
        { login: 'super@gmail.fr', role: 'super-organisateur', password: 'super', validated: true },
        { login: 'orga@gmail.fr', role: 'organisateur', password: 'organisateur', validated: true },
        { login: 'benevole@gmail.fr', role: 'benevole', password: 'benevole', validated: true },
        { login: 'editeur@gmail.fr', role: 'editeur', password: 'editeur', validated: true },
        { login: 'nonvalide@gmail.fr', role: 'non-valide', password: 'nonvalide', validated: false },
    ];

    for (const user of defaultUsers) {
        const hash = await bcrypt.hash(user.password, 10);
        try {
            await pool.query(
                `INSERT INTO users (login, password_hash, role, validated)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (login) DO NOTHING`,
                [user.login, hash, user.role, user.validated]
            );
        } catch (error) {
            console.error(`Erreur lors de la création du compte ${user.role} :`, error);
            throw error;
        }
    }

    console.log('Comptes par défaut vérifiés ou créés');
}
