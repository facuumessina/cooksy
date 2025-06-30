// app/api/index.ts
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes';
import recipeRoutes from './routes/recipeRoutes';
import userRoutes from './routes/userRoutes';

import './model/Receta';
import './model/Usuario';

const app = express();
const port = process.env.PORT ?? 3000;

// Conexión a MongoDB
mongoose
  .connect('mongodb+srv://fmessina:Test2025DESA@cluster0.rfzx4fd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar MongoDB:', err));

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/auth',    authRoutes);
app.use('/recipes', recipeRoutes);
app.use('/users',   userRoutes);

// Endpoint de prueba
app.get('/test', (_req, res) => {
  res.send('funcionó');
});

// Arrancar servidor
app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`);
});