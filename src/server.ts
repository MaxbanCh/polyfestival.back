// import fs from 'fs'
// import https from 'https'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import festivalRouter from './routes/festival.ts'
import usersRouter from './routes/auth.ts'
import gameRouter from './routes/game.ts'
import actorRouter from './routes/actor.ts'
// import { ensureAdmin } from './database/initAdmin.ts'
// import { verifyToken } from './middleware/token-management.ts'
// import { requireAdmin } from './middleware/auth-admin.ts'

// await ensureAdmin()

const app = express();
dotenv.config()

app.use((req, res, next) => {
	res.setHeader('X-Content-Type-Options', 'nosniff')
	res.setHeader('X-Frame-Options', 'SAMEORIGIN')
	res.setHeader('Referrer-Policy', 'no-referrer')
	res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
	res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
	res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});
app.use(morgan('dev')) // Log des requêtes : Visualiser le flux de requêtes entre Angular et Express
app.use(express.json())
app.use(cookieParser())
app.use(cors({
	origin: 'http://localhost:4200',
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/festivals', festivalRouter);
app.use('/api/users', usersRouter);
app.use('/api/games', gameRouter);
app.use('/api/actors', actorRouter);
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
	res.send('Hello, Polyfestival Back!');
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});