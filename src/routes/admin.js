const express = require('express');
const router = express.Router();
const multer = require('multer');

const adminController = require('../app/controllers/AdminController');
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

router.get('/quan-ly-san-pham/them-san-pham', isLogin, isAdmin, adminController.getCreateProduct);
router.post('/quan-ly-san-pham/them-san-pham', isLogin, isAdmin, upload.array('imageProduct'), adminController.postCreateProduct);
router.get('/quan-ly-san-pham/:id/edit', isLogin, isAdmin, adminController.getEditProduct);
router.put('/quan-ly-san-pham/:id', isLogin, isAdmin, upload.array('imageProduct'), adminController.updateProduct);
router.get('/quan-ly-san-pham/thung-rac', isLogin, isAdmin, adminController.getListTrashProduct);
router.patch('/quan-ly-san-pham/:id/khoi-phuc', isLogin, isAdmin, adminController.restoreProduct);
router.delete('/quan-ly-san-pham/:id/xoa-vinh-vien', isLogin, isAdmin, adminController.forceDestroyProduct);
router.delete('/quan-ly-san-pham/:id', isLogin, isAdmin, adminController.deleteProduct);
router.get('/quan-ly-san-pham', isLogin, isAdmin, adminController.getListProduct);
router.post('/quan-ly-san-pham/handle-form-actions', isLogin, isAdmin, adminController.handleFormActions);

router.get('/quan-ly-bai-dang/tao-bai-dang', isLogin, isAdmin, adminController.getCreatePost);
router.post('/quan-ly-bai-dang/tao-bai-dang', isLogin, isAdmin, upload.single('imagePost'), adminController.postCreatePost);
router.get('/quan-ly-bai-dang/:id/edit', isLogin, isAdmin, adminController.getEditPost);
router.put('/quan-ly-bai-dang/:id', isLogin, isAdmin, upload.single('imagePost'), adminController.updatePost);
router.get('/quan-ly-bai-dang/thung-rac', isLogin, isAdmin, adminController.getListTrashPost);
router.patch('/quan-ly-bai-dang/:id/khoi-phuc', isLogin, isAdmin, adminController.restorePost);
router.delete('/quan-ly-bai-dang/:id/xoa-vinh-vien', isLogin, isAdmin, adminController.forceDestroyPost);
router.delete('/quan-ly-bai-dang/:id', isLogin, isAdmin, adminController.deletePost);
router.get('/quan-ly-bai-dang', isLogin, isAdmin, adminController.getListPost);

router.get('/quan-ly-danh-muc/them-danh-muc', isLogin, isAdmin, adminController.getCreateCategory);
router.post('/quan-ly-danh-muc/them-danh-muc', isLogin, isAdmin, adminController.postCreateCategory);
router.get('/quan-ly-danh-muc/:id/edit', isLogin, isAdmin, adminController.getEditCategory);
router.put('/quan-ly-danh-muc/:id', isLogin, isAdmin, adminController.updateCategory);
router.delete('/quan-ly-danh-muc/:id', isLogin, isAdmin, adminController.deleteCategory);
router.get('/quan-ly-danh-muc', isLogin, isAdmin, adminController.getListCategory);

router.put('/quan-ly-don-hang/:id', isLogin, isAdmin, adminController.updateOrderStatus);
router.get('/quan-ly-don-hang', isLogin, isAdmin, adminController.getListOrder);

router.get('/danh-gia-cua-hang', isLogin, isAdmin, adminController.getListEvaluate);
router.post('/danh-gia-cua-hang', isLogin, isAdmin, adminController.postReplyEvaluate);

router.post('/quan-ly-tai-khoan/khoa-tai-khoan:id', isLogin, isAdmin, adminController.lockAccount);
router.post('/quan-ly-tai-khoan/mo-khoa-tai-khoan:id', isLogin, isAdmin, adminController.unlockAccount);
router.get('/quan-ly-tai-khoan', isLogin, isAdmin, adminController.getlListAccount);

router.get('/thong-ke', isLogin, isAdmin, adminController.getStatistical);

module.exports = router;
