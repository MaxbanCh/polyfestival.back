import pkg from 'pg'
const { Pool } = pkg

// Récupération de la variable d'environnement Docker
const pool = new Pool({
    connectionString:
    process.env.DATABASE_URL ||
    'postgres://polyfestival:polyfestival@localhost:5432/polyfestival',
});

function initializeDatabase() {
    pool.connect()
    .then(client => {
        console.log('Connected to the database');
        
    })
    .catch(err => {
        console.error('Error connecting to the database', err);
    });
}

export default pool