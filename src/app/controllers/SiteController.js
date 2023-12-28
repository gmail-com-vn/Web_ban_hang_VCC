const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');

const { validationResult } = require('express-validator/check');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { mutipleMongooseToObject, mongooseToObjiect } = require('../../util/mongoose');
sgMail.setApiKey('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');

const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: 'dlkm9tiem',
    api_key: '778982786272933',
    api_secret: 'fTrhzosPAPmkI__Lj6qcyPljDeQ',
});

class SiteController {
    getLogin(req, res, next) {
        res.render('auth/login', {
            errorMessage: req.flash('error'),
            oldInput: {
                email: '',
                password: '',
                confirmPassword: '',
            },
            validationErrors: [],
        });
    }

    postLogin(req, res, next) {
        const email = req.body.email;
        const password = req.body.password;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/login', {
                errorMessage: errors.array()[0].msg,
                oldInput: { email: email, password: password },
                validationErrors: errors.array(),
            });
        }
        User.findOne({ email: email })
            .then((user) => {
                if (!user) {
                    return res.status(422).render('auth/login', {
                        errorMessage: 'Email hoặc mật khẩu không hợp lệ!',
                        oldInput: { email: email, password: password },
                        validationErrors: [],
                    });
                }
                bcrypt
                    .compare(password, user.password)
                    .then((doMatch) => {
                        if (doMatch) {
                            req.session.isLoggedIn = true;
                            req.session.user = user;
                            req.session.role = user.role;
                            return req.session.save(() => {
                                res.redirect('/');
                            });
                        }
                        return res.status(422).render('auth/login', {
                            errorMessage: 'Email hoặc mật khẩu không hợp lệ!',
                            oldInput: { email: email, password: password },
                            validationErrors: [],
                        });
                    })
                    .catch(() => {
                        res.redirect('/dang-nhap');
                    });
            })
            .catch(next);
    }

    postLogout(req, res, next) {
        req.session.destroy(() => {
            res.redirect('/');
        });
    }

    getSignup(req, res, next) {
        res.render('auth/signup', {
            errorMessage: req.flash('error'),
            oldInput: {
                firstname: '',
                lastname: '',
                email: '',
                password: '',
                confirmPassword: '',
            },
            validationErrors: [],
        });
    }

    postSignup(req, res, next) {
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const email = req.body.email;
        const password = req.body.password;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.status(422).render('auth/signup', {
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    password: password,
                    confirmPassword: req.body.confirmPassword,
                },
                validationErrors: errors.array(),
            });
        }
        bcrypt
            .hash(password, 12)
            .then((hashedPassword) => {
                const user = new User({
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    password: hashedPassword,
                    avatar: '/image/avatar-default.png',
                    role: 'CUSTOMER',
                    cart: {
                        items: [],
                    },
                });
                return user.save();
            })
            .then(() => {
                res.redirect('/dang-nhap');
                return sgMail.send({
                    to: email,
                    from: 'mvt16102001@gmail.com',
                    subject: 'Đăng ký thành công',
                    html: '<h1>Bạn đã đăng ký thành công!</h1>',
                });
            })
            .catch(next);
    }

    search(req, res, next) {
        Product.find({
            $or: [{ name: { $regex: new RegExp(req.query.keyword, 'i') } }],
        })
            // .limit(7)
            .populate('categoryId')
            .then((products) => {
                res.render('site/search', {
                    products: mutipleMongooseToObject(products),
                });
            })
            .catch(next);
    }

    getCart(req, res, next) {
        req.user
            .populate({
                path: 'cart.items.productId',
                populate: {
                    path: 'categoryId',
                    model: 'Category',
                },
            })
            .then((user) => {
                const products = user.cart.items;
                console.log(products);
                let total = 0;
                products.forEach((p) => {
                    total += p.quantity * p.productId.price;
                });
                res.render('customer/cart', {
                    products: mutipleMongooseToObject(products),
                    total: total,
                });
            })
            .catch(next);
    }

    addCart(req, res, next) {
        const prodId = req.body.productId;
        const quantity = req.body.quantity;
        Product.findById(prodId)
            .then((product) => {
                return req.user.addToCart(product, quantity);
            })
            .then(() => {
                req.session.user = req.user;
                return req.session.save(() => {
                    res.redirect('/gio-hang');
                });
            })
            .catch(next);
    }

    postCartDeleteProduct(req, res, next) {
        const prodId = req.body.productId;
        req.user
            .removeFromCart(prodId)
            .then(() => {
                req.session.user = req.user;
                return req.session.save(() => {
                    res.redirect('/gio-hang');
                });
            })
            .catch(next);
    }

    getPay(req, res, next) {
        req.user
            .populate({
                path: 'cart.items.productId',
                populate: {
                    path: 'categoryId',
                    model: 'Category',
                },
            })
            .then((user) => {
                const products = user.cart.items;
                console.log(products);
                let total = 0;
                products.forEach((p) => {
                    total += p.quantity * p.productId.price;
                });
                res.render('customer/pay', {
                    products: mutipleMongooseToObject(products),
                    total: total,
                });
            })
            .catch(next);
    }

    postOrder(req, res, next) {
        req.user
            .populate('cart.items.productId')
            .then((user) => {
                const products = user.cart.items.map((i) => {
                    return { quantity: i.quantity, product: { ...i.productId._doc } };
                });
                console.log(products);
                let total = 0;
                products.forEach((p) => {
                    total += p.quantity * p.product.price;
                });
                const order = new Order({
                    customerId: user._id,
                    orderStatus: 'Chờ xác nhận',
                    name: req.body.name,
                    phone: req.body.phone,
                    address: req.body.address,
                    products: products,
                    totalMonney: total,
                });
                return order.save();
            })
            .then(() => {
                return req.user.clearCart();
            })
            .then(() => {
                req.session.user = req.user;
                return req.session.save(() => {
                    res.redirect('/don-hang-cua-toi');
                });
            });
    }

    getOrder(req, res, next) {
        Order.find({ 'user.userId': req.user._id })
            .then((orders) => {
                res.render('customer/order', {
                    orders: mutipleMongooseToObject(orders),
                });
            })
            .catch(next);
    }

    getProfile(req, res, next) {
        User.findOne({ id: req.user._id })
            .then((user) => {
                res.render('customer/profile', {
                    user: mongooseToObjiect(user),
                });
            })

            .catch(next);
    }

    updateProfile(req, res, next) {
        User.updateOne(
            { _id: req.user._id },
            {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.phone,
                address: req.body.address,
            },
        )
            .then(() => res.redirect('/ho-so-cua-toi'))
            .catch(next);
    }
    async updateAvatar(req, res, next) {
        let imagePaths = '';
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imagePaths = result.secure_url;
            User.updateOne(
                { _id: req.params.id },
                {
                    avatar: imagePaths,
                },
            )
                .then(() => res.redirect('/ho-so-cua-toi'))
                .catch(next);
        }
    }

    getHome(req, res, next) {
        res.render('home', { cssPath: 'home.css' });
    }
}

module.exports = new SiteController();
