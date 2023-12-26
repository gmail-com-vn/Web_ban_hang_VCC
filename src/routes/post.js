const express = require('express');
const router = express.Router();

const postController = require('../app/controllers/PostController');

router.get('/:slug', postController.getPost);
router.get('/', postController.getAllPost);

module.exports = router;
