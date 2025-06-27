const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = 3000;

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