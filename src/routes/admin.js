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

router.get('/quan-ly-san-pham/them-san-pham', adminControllers.getCreateProduct);
router.post('/quan-ly-san-pham/them-san-pham', upload.array('imageProduct'), adminControllers.postCreateProduct);
router.get('/quan-ly-san-pham/:id/edit', adminControllers.getEditProduct);
router.put('/quan-ly-san-pham/:id', upload.array('imageProduct'), adminControllers.updateProduct);
router.get('/quan-ly-san-pham/thung-rac', adminControllers.getListTrashProduct);
router.patch('/quan-ly-san-pham/:id/khoi-phuc', adminControllers.restoreProduct);
router.delete('/quan-ly-san-pham/:id/xoa-vinh-vien', adminControllers.forceDestroyProduct);
router.delete('/quan-ly-san-pham/:id', adminControllers.deleteProduct);
router.get('/quan-ly-san-pham', adminControllers.getListProduct);

router.get('/quan-ly-bai-dang/tao-bai-dang', adminControllers.getCreatePost);
router.post('/quan-ly-bai-dang/tao-bai-dang', upload.single('imagePost'), adminControllers.postCreatePost);
router.get('/quan-ly-bai-dang/:id/edit', adminControllers.getEditPost);
router.put('/quan-ly-bai-dang/:id', upload.single('imagePost'), adminControllers.updatePost);
router.get('/quan-ly-bai-dang/thung-rac', adminControllers.getListTrashPost);
router.patch('/quan-ly-bai-dang/:id/khoi-phuc', adminControllers.restorePost);
router.delete('/quan-ly-bai-dang/:id/xoa-vinh-vien', adminControllers.forceDestroyPost);
router.delete('/quan-ly-bai-dang/:id', adminControllers.deletePost);
router.get('/quan-ly-bai-dang', adminControllers.getListPost);

router.get('/quan-ly-danh-muc/them-danh-muc', adminControllers.getCreateCategory);
router.post('/quan-ly-danh-muc/them-danh-muc', adminControllers.postCreateCategory);
router.get('/quan-ly-danh-muc/:id/edit', adminControllers.getEditCategory);
router.put('/quan-ly-danh-muc/:id', adminControllers.updateCategory);
router.delete('/quan-ly-danh-muc/:id', adminControllers.deleteCategory);
router.get('/quan-ly-danh-muc', adminControllers.getListCategory);

module.exports = router;
