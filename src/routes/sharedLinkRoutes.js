const { Router } = require('express');
const { createLink, getLink } = require('../controllers/shareController');

const router = Router();

router.post('/create', createLink);
router.get('/:slug', getLink);

module.exports = router;
