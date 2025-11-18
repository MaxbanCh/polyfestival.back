import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();

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

app.use(cors({
	origin: 'https://localhost',
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization']
}));

dotenv.config();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
	res.send('Hello, Polyfestival Back!');
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});