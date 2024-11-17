const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AppDataSource = require('./config/db');
const { videoRoutes, shareRoutes, publicRoutes } = require('./routes');
const { authenticate } = require('./middlewares/authMiddleware');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/v1.0/video', authenticate, videoRoutes);
app.use('/api/v1.0/share', authenticate, shareRoutes);

app.use('/s', publicRoutes);

// Error Middleware
app.use(errorMiddleware);

// Initializing DB
AppDataSource.initialize()
    .then(() => console.log('Database connected!!'))
    .catch((error) => console.error('Database connection error: ', error));

module.exports = app;
