const { Router } = require('express');
const {
    uploadVideo,
    trimVideo,
    mergeVideo,
} = require('../controllers/VideoController');

const router = Router();

router.post('/upload', uploadVideo);
router.post('/trim', trimVideo);
router.post('/merge', mergeVideo);

module.exports = router;
