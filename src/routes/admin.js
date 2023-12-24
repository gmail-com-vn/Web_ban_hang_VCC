const express = require('express');
const router = express.Router();
const multer = require('multer');

const adminControllers = require('../app/controllers/AdminController');

const storage = multer.diskStorage({
    destination: function (req, files, cb) {
        cb(null, './src/public/uploads');
    },
    filename: function (req, files, cb) {
        cb(null, Date.now() + files.originalname);
    },
});

const upload = multer({ storage: storage });

router.get('/san-pham/them-san-pham', adminControllers.getCreateProduct);
router.post('/san-pham/them-san-pham', upload.array('imageProduct'), adminControllers.postCreateProduct);

module.exports = router;
