const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

mongoose.connect('mongodb+srv://fmessina:Test2025DESA@cluster0.rfzx4fd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('✅ Conectado a MongoDB');
  })
  .catch((err) => {
    console.error('❌ Error al conectar MongoDB:', err);
  });

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
// Acá agregarás recipeRoutes y userRoutes también

app.get('/test', (req, res) => {
    res.send('funcionó');
  });

app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`);
});