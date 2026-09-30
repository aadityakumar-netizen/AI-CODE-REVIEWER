const express = require('express');
const protect = require('../middleware/auth');
const { getRepository } = require('../controllers/githubController');
const router = express.Router();
router.use(protect);
router.get('/repository', getRepository);
module.exports = router;
