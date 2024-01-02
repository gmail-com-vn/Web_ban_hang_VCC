const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');

const { validationResult } = require('express-validator/check');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { mutipleMongooseToObject, mongooseToObjiect } = require('../../util/mongoose');
const Rating = require('../models/Rating');

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
                if (user.lock === true) {
                    return res.status(422).render('auth/login', {
                        errorMessage: 'Tài khoản của bạn đã bị khóa!',
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
                    cssPath: 'product.css',
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
                    cssPath: 'customer.css',
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
                    cssPath: 'customer.css',
                });
            })
            .catch(next);
    }

    async postOrder(req, res, next) {
        try {
            const user = await req.user.populate('cart.items.productId');

            const products = user.cart.items.map((i) => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            });

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

            const savedOrder = await order.save();

            const updateQuantityPromises = savedOrder.products.map(async (prod) => {
                const updatedProduct = await Product.findByIdAndUpdate(
                    prod.product._id,
                    {
                        $inc: { quantitySold: prod.quantity, quantityWarehouse: -prod.quantity },
                    },
                    { new: true },
                );
                return updatedProduct;
            });

            const updatedProducts = await Promise.all(updateQuantityPromises);

            await req.user.clearCart();

            req.session.user = req.user;
            req.session.save(() => {
                res.redirect('/don-hang-cua-toi');
            });
        } catch (err) {
            console.error(err);
            // Xử lý lỗi nếu có
            // Ví dụ: res.status(500).send('Error occurred');
        }
    }

    getOrder(req, res, next) {
        Order.find({ 'user.userId': req.user._id })
            .then((orders) => {
                res.render('customer/order', {
                    orders: mutipleMongooseToObject(orders),
                    cssPath: 'customer.css',
                });
            })
            .catch(next);
    }

    getProfile(req, res, next) {
        User.findOne({ id: req.user._id })
            .then((user) => {
                res.render('customer/profile', {
                    user: mongooseToObjiect(user),
                    cssPath: 'customer.css',
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
    getEvaluate(req, res, next) {
        let ratedProducts, unratedProducts, ratingList;

        // Lấy các sản phẩm đã được đánh giá bởi người dùng (req.user.id)
        Rating.find({ userId: req.user.id })
            .populate({
                path: 'productId',
                populate: {
                    path: 'categoryId',
                    model: 'Category',
                },
            })
            .populate('customerId')
            // .populate('productId')
            .then((ratings) => {
                ratingList = ratings;
                ratedProducts = ratings.map((rating) => rating.productId._id);
                console.log('rating', ratedProducts);

                // Lấy tất cả đơn hàng của người dùng hiện tại (req.user.id)
                return Order.find({ customerId: req.user.id });
            })
            .then((orders) => {
                const productIdsInOrders = orders.flatMap((order) => order.products.map((product) => product.product)); // Lấy tất cả productId từ các đơn hàng của người dùng

                // Lấy tất cả sản phẩm dựa trên các productId
                return Product.find({ _id: { $in: productIdsInOrders } }).populate('categoryId');
            })
            .then((products) => {
                console.log('products', products);

                // Tìm các sản phẩm đã đánh giá
                const ratedProductsInfo = products.filter((product) => ratedProducts.includes(product._id));

                // Tìm các sản phẩm chưa được đánh giá
                unratedProducts = products.filter((product) => !ratedProducts.includes(product._id));

                res.render('customer/evaluate', {
                    ratedProducts: mutipleMongooseToObject(ratedProductsInfo),
                    unratedProducts: mutipleMongooseToObject(unratedProducts),
                    ratingList: mutipleMongooseToObject(ratingList),
                    cssPath: 'customer.css',
                });
                console.log('Các sản phẩm đã đánh giá:', ratedProductsInfo);
                console.log('Các sản phẩm chưa được đánh giá:', unratedProducts);
                console.log('Các đánh giá:', ratingList);
            })
            .catch((err) => {
                // Xử lý lỗi nếu có
                console.error(err);
            });
    }

    async postEvaluate(req, res, next) {
        let imagePaths = '';
        console.log(req.file);
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imagePaths = result.secure_url;
            const rating = new Rating({
                productId: req.body.productId,
                star: req.body.star,
                comment: req.body.comment,
                customerId: req.user._id,
                imageRating: imagePaths,
            });
            rating
                .save()
                .then(() => res.redirect('back'))
                .catch(next);
        } else {
            const rating = new Rating({
                productId: req.body.productId,
                star: req.body.star,
                comment: req.body.comment,
                customerId: req.user._id,
            });
            rating
                .save()
                .then(() => res.redirect('back'))
                .catch(next);
        }
    }
    getReset(req, res, next) {
        res.render('auth/reset', {
            errorMessage: req.flash('error'),
        });
    }

    postReset(req, res, next) {
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                console.log(err);
                return res.redirect('/dat-lai-mat-khau');
            }
            const token = buffer.toString('hex');
            User.findOne({ email: req.body.email })
                .then((user) => {
                    if (!user) {
                        req.flash('error', 'Không tìm thấy tài khoản');
                        return res.redirect('/dat-lai-mat-khau');
                    }
                    user.resetToken = token;
                    user.resetTokenExpiration = Date.now() + 360000;
                    return user.save();
                })
                .then(() => {
                    res.redirect(`/dat-lai-mat-khau/${token}`);
                    transporter.sendMail({
                        to: req.body.email,
                        from: 'mvt16102001@gmail.com',
                        subject: 'Đặt lại mật khẩu',
                        html: `
                        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn</p>
                        <p>Click vào <a href="http://localhost:3000/dat-lai-mat-khau/${token}">Đây</a> để đặt mật khẩu mới</p>
                        `,
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    }

    getNewPassword(req, res, next) {
        const token = req.params.token;
        User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
            .then((user) => {
                res.render('auth/new-password', {
                    errorMessage: req.flash('error'),
                    userId: user._id.toString(),
                    passwordToken: token,
                });
            })
            .catch((err) => console.log(err));
    }

    postNewPassword(req, res, next) {
        const newPassword = req.body.password;
        const userId = req.body.userId;
        const passwordToken = req.body.passwordToken;
        let resetUser;
        User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: Date.now() },
            _id: userId,
        })
            .then((user) => {
                resetUser = user;
                return bcrypt.hash(newPassword, 12);
            })
            .then((hashedPassword) => {
                resetUser.password = hashedPassword;
                resetUser.resetToken = undefined;
                resetUser.resetTokenExpiration = undefined;
                return resetUser.save();
            })
            .then(() => {
                res.redirect('/dang-nhap');
            })
            .catch(next);
    }

    getHome(req, res, next) {
        res.render('home', { cssPath: 'home.css' });
    }
}

module.exports = new SiteController();
