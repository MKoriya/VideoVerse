const { Router } = require('express');
const { uploadVideo } = require('../controllers/VideoController');

const router = Router();

router.post('/upload', uploadVideo);

module.exports = router;
