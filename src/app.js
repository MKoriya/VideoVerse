const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AppDataSource = require('./config/db');
const { videoRoutes } = require('./routes');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/v1.0/video', videoRoutes);

// Initializing DB
AppDataSource.initialize()
    .then(() => console.log('Database connected!!'))
    .catch((error) => console.error('Database connection error: ', error));

module.exports = app;
