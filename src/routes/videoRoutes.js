const { Router } = require('express');
const { uploadVideo, trimVideo } = require('../controllers/VideoController');

const router = Router();

router.post('/upload', uploadVideo);
router.post('/trim', trimVideo);

module.exports = router;
