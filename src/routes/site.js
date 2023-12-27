const express = require('express');
const { check, body } = require('express-validator/check');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');
const User = require('../app/models/User');

const isLoginSuccess = require('../app/middlewares/isLoginSuccess');
const isLogin = require('../app/middlewares/isLogin');

router.get('/dang-nhap', isLoginSuccess, siteController.getLogin);
router.post(
    '/dang-nhap',
    isLoginSuccess,
    [
        body('email').isEmail().withMessage('Vui lòng nhập email hợp lệ').normalizeEmail(),

        body('password', 'Vui lòng nhập mật khẩu chỉ có số và văn bản và ít nhất 6 ký tự!').isLength({ min: 6 }).isAlphanumeric().trim(),
    ],
    siteController.postLogin,
);
router.get('/dang-ky', isLoginSuccess, siteController.getSignup);

router.post(
    '/dang-ky',
    isLoginSuccess,
    [
        check('email')
            .isEmail()
            .withMessage('Vui lòng nhập email hợp lệ!')
            .custom((value, { req }) => {
                // if (value === 'mvt.16102001@gmail.com') {
                //     throw new Error('Email này bị cấm sử dụng')
                // }
                // return true
                return User.findOne({ email: value }).then((userDoc) => {
                    if (userDoc) {
                        return Promise.reject('Email đã được sử dụng!');
                    }
                });
            })
            .normalizeEmail(),

        body('password', 'Vui lòng nhập mật khẩu chỉ có số và văn bản và ít nhất 6 ký tự!').isLength({ min: 6 }).isAlphanumeric().trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Mật khẩu phải khớp!');
                }
                return true;
            }),
    ],
    siteController.postSignup,
);

router.post('/dang-xuat', isLogin, siteController.postLogout);

// router.get('/dat-lai-mat-khau', siteController.getReset);

// router.post('/dat-lai-mat-khau', siteController.postReset);

// router.get('/dat-lai-mat-khau/:token', siteController.getNewPassword);

// router.post('/mat-khau-moi', siteController.postNewPassword);

router.get('/tim-kiem', siteController.search);
router.get('/', siteController.getHome);

module.exports = router;
