const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
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

module.exports = app;
