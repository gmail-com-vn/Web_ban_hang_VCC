const express = require('express');
const router = express.Router();

const productController = require('../app/controllers/ProductController');

router.get('/all', productController.getAllProduct);
router.get('/:slugCategory/:slug', productController.getProduct);
router.get('/:slugCategory', productController.showCategory);

module.exports = router;
