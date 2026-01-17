import pkg from 'pg';
const { Pool } = pkg;

// Récupération de la variable d'environnement Docker
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://polyfestival:polyfestival@localhost:5432/polyfestival',
});

export default pool;
