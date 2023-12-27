const express = require('express');
const router = express.Router();
const multer = require('multer');

const adminControllers = require('../app/controllers/AdminController');
const isAdmin = require('../app/middlewares/isAdmin');
const isLogin = require('../app/middlewares/isLogin');

const storage = multer.diskStorage({
    destination: function (req, files, cb) {
        cb(null, './src/public/uploads');
    },
    filename: function (req, files, cb) {
        cb(null, Date.now() + files.originalname);
    },
});

const upload = multer({ storage: storage });

router.get('/quan-ly-san-pham/them-san-pham', isLogin, isAdmin, adminControllers.getCreateProduct);
router.post('/quan-ly-san-pham/them-san-pham', isLogin, isAdmin, upload.array('imageProduct'), adminControllers.postCreateProduct);
router.get('/quan-ly-san-pham/:id/edit', isLogin, isAdmin, adminControllers.getEditProduct);
router.put('/quan-ly-san-pham/:id', isLogin, isAdmin, upload.array('imageProduct'), adminControllers.updateProduct);
router.get('/quan-ly-san-pham/thung-rac', isLogin, isAdmin, adminControllers.getListTrashProduct);
router.patch('/quan-ly-san-pham/:id/khoi-phuc', isLogin, isAdmin, adminControllers.restoreProduct);
router.delete('/quan-ly-san-pham/:id/xoa-vinh-vien', isLogin, isAdmin, adminControllers.forceDestroyProduct);
router.delete('/quan-ly-san-pham/:id', isLogin, isAdmin, adminControllers.deleteProduct);
router.get('/quan-ly-san-pham', isLogin, isAdmin, adminControllers.getListProduct);

router.get('/quan-ly-bai-dang/tao-bai-dang', isLogin, isAdmin, adminControllers.getCreatePost);
router.post('/quan-ly-bai-dang/tao-bai-dang', isLogin, isAdmin, upload.single('imagePost'), adminControllers.postCreatePost);
router.get('/quan-ly-bai-dang/:id/edit', isLogin, isAdmin, adminControllers.getEditPost);
router.put('/quan-ly-bai-dang/:id', isLogin, isAdmin, upload.single('imagePost'), adminControllers.updatePost);
router.get('/quan-ly-bai-dang/thung-rac', isLogin, isAdmin, adminControllers.getListTrashPost);
router.patch('/quan-ly-bai-dang/:id/khoi-phuc', isLogin, isAdmin, adminControllers.restorePost);
router.delete('/quan-ly-bai-dang/:id/xoa-vinh-vien', isLogin, isAdmin, adminControllers.forceDestroyPost);
router.delete('/quan-ly-bai-dang/:id', isLogin, isAdmin, adminControllers.deletePost);
router.get('/quan-ly-bai-dang', isLogin, isAdmin, adminControllers.getListPost);

router.get('/quan-ly-danh-muc/them-danh-muc', isLogin, isAdmin, adminControllers.getCreateCategory);
router.post('/quan-ly-danh-muc/them-danh-muc', isLogin, isAdmin, adminControllers.postCreateCategory);
router.get('/quan-ly-danh-muc/:id/edit', isLogin, isAdmin, adminControllers.getEditCategory);
router.put('/quan-ly-danh-muc/:id', isLogin, isAdmin, adminControllers.updateCategory);
router.delete('/quan-ly-danh-muc/:id', isLogin, isAdmin, adminControllers.deleteCategory);
router.get('/quan-ly-danh-muc', isLogin, isAdmin, adminControllers.getListCategory);

module.exports = router;
