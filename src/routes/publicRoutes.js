const { Router } = require('express');
const { serveSharedVideo } = require('../controllers/shareController');

const router = Router();

router.get('/:slug', serveSharedVideo);

module.exports = router;
