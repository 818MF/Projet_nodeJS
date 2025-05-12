require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./services/user/routes');
const movieRoutes = require('./services/movie/routes');
const { connectRabbitMQ } = require('./config/rabbitmq');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Connect to RabbitMQ
connectRabbitMQ()
  .then(() => console.log('Connected to RabbitMQ'))
  .catch(err => console.error('RabbitMQ connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 