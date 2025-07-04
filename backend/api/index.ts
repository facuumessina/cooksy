// app/api/index.ts
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import recipeRoutes from './routes/recipeRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

// Render inyecta el puerto por env
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar MongoDB:', err));

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/recipes', recipeRoutes);
app.use('/users', userRoutes);

app.get('/test', (_req, res) => {
  res.send('funcionó');
});

app.listen(port, () => {
  console.log(`API corriendo en ${process.env.PORT}`);
});