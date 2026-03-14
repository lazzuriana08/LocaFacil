const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const electronicRoutes = require('./routes/electronics');
const rentalRoutes = require('./routes/rentals');
const insuranceRoutes = require('./routes/insurance');
const userRoutes = require('./routes/users');

const app = express();

// Middlewares
app.use(cors());D
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'API LocaFácil is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/electronics', electronicRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/users', userRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Api ta rodando kkkkk' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Erro interno' });
});

const PORT = process.env.PORT || 5000;

// Somente iniciar servidor se não estiver em ambiente Vercel
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`✓ Servidor LocaFácil rodando na porta ${PORT}`);
    console.log(`✓ Ambiente: ${process.env.NODE_ENV}`);
  });
}

// Exportar para Vercel Serverless
module.exports = app;
