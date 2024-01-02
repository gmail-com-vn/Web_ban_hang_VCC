const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudinary = require('cloudinary').v2;

const { mongooseToObjiect } = require('../../util/mongoose');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { Promise } = require('mongoose');
const Post = require('../models/Post');
const Order = require('../models/Order');
const User = require('../models/User');
const Rating = require('../models/Rating');

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: 'dlkm9tiem',
    api_key: '778982786272933',
    api_secret: 'fTrhzosPAPmkI__Lj6qcyPljDeQ',
});

class AdminController {
    getCreateProduct(req, res, next) {
        Category.find({})
            .then((categories) =>
                res.render('admin/product/create-product', {
                    categories: mutipleMongooseToObject(categories),
                    cssPath: 'admin-product.css',
                }),
            )
            .catch(next);
    }

    async postCreateProduct(req, res, next) {
        try {
            let imagePaths = [];
            console.log(req.body);

            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path);
                imagePaths.push(result.secure_url);
            }
            console.log(imagePaths);

            const newProduct = new Product({
                name: req.body.name,
                categoryId: req.body.categoryId,
                description: req.body.description,
                price: req.body.price,
                tradeMark: req.body.tradeMark,
                quantityWarehouse: req.body.quantityWarehouse,
                imageProduct: imagePaths,
                userId: req.user,
                quantitySold: 0,
            });

            await newProduct.save();
            res.redirect('/admin/quan-ly-san-pham');
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    getEditProduct(req, res, next) {
        Promise.all([Product.findById(req.params.id), Category.find({})])
            .then(([product, categories]) =>
                res.render('admin/product/edit-product', {
                    product: mongooseToObjiect(product),
                    categories: mutipleMongooseToObject(categories),
                    cssPath: 'admin-product.css',
                }),
            )
            .catch(next);
    }
    async updateProduct(req, res, next) {
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path);
                imagePaths.push(result.secure_url);
            }

            Product.updateOne(
                { _id: req.params.id },
                {
                    name: req.body.name,
                    categoryId: req.body.categoryId,
                    description: req.body.description,
                    price: req.body.price,
                    tradeMark: req.body.tradeMark,
                    quantityWarehouse: req.body.quantityWarehouse,
                    imageProduct: imagePaths,
                },
            )
                .then(() => res.redirect('/admin/quan-ly-san-pham'))
                .catch(next);
        } else {
            Product.updateOne(
                { _id: req.params.id },
                {
                    name: req.body.name,
                    categoryId: req.body.categoryId,
                    description: req.body.description,
                    price: req.body.price,
                    tradeMark: req.body.tradeMark,
                    quantityWarehouse: req.body.quantityWarehouse,
                },
            )
                .then(() => res.redirect('/admin/quan-ly-san-pham'))
                .catch(next);
        }
    }
    deleteProduct(req, res, next) {
        Product.delete({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    getListTrashProduct(req, res, next) {
        Product.findDeleted({})
            .populate('categoryId')
            .then((products) => {
                console.log(products);
                res.render('admin/product/trash-product', {
                    products: mutipleMongooseToObject(products),
                    cssPath: 'admin-product.css',
                });
            });
    }

    forceDestroyProduct(req, res, next) {
        Product.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    restoreProduct(req, res, next) {
        Product.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    getListProduct(req, res, next) {
        Promise.all([Product.find({}).populate('categoryId'), Product.countDocumentsDeleted({})])
            .then(([products, deletedCount]) =>
                res.render('admin/product/list-product', { products: mutipleMongooseToObject(products), deletedCount, cssPath: 'admin-product.css' }),
            )
            .catch(next);
    }

    handleFormActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                Product.delete({ _id: { $in: req.body.productIds } })
                    .then(() => res.redirect('back'))
                    .catch(next);
                break;
            default:
                res.json({ message: 'Action is invalid' });
        }
    }

    getCreateCategory(req, res, next) {
        res.render('admin/category/create-category', { cssPath: 'admin-category.css' });
    }
    postCreateCategory(req, res, next) {
        const category = new Category({
            categoryProduct: req.body.categoryProduct,
        });
        category
            .save()
            .then(() => res.redirect('/admin/quan-ly-danh-muc'))
            .catch(next);
    }

    getListCategory(req, res, next) {
        Category.find({})
            .then((categories) =>
                res.render('admin/category/list-category', {
                    categories: mutipleMongooseToObject(categories),
                    cssPath: 'admin-category.css',
                }),
            )
            .catch(next);
    }
    getEditCategory(req, res, next) {
        Category.findById(req.params.id)
            .then((category) =>
                res.render('admin/category/edit-category', {
                    category: mongooseToObjiect(category),
                    cssPath: 'admin-category.css',
                }),
            )
            .catch(next);
    }
    updateCategory(req, res, next) {
        Category.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('/admin/quan-ly-danh-muc'))
            .catch(next);
    }
    deleteCategory(req, res, next) {
        Category.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    getCreatePost(req, res, next) {
        res.render('admin/post/create-post', { cssPath: 'admin-post.css' });
    }

    async postCreatePost(req, res, next) {
        try {
            let imagePaths = '';
            console.log(req.body);

            // for (const file of req.files) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imagePaths = result.secure_url;
            // }
            console.log(imagePaths);

            const post = new Post({
                title: req.body.title,
                content: req.body.content,
                imagePost: imagePaths,
                userId: req.user,
            });

            await post.save();
            res.redirect('/admin/quan-ly-bai-dang');
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    getEditPost(req, res, next) {
        Post.findById(req.params.id)
            .then((post) => res.render('admin/post/edit-post', { post: mongooseToObjiect(post), cssPath: 'admin-post.css' }))
            .catch(next);
    }
    async updatePost(req, res, next) {
        let imagePaths = '';
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imagePaths = result.secure_url;
            Post.updateOne(
                { _id: req.params.id },
                {
                    title: req.body.title,
                    content: req.body.content,
                    imagePost: imagePaths,
                },
            )
                .then(() => res.redirect('/admin/quan-ly-bai-dang'))
                .catch(next);
        } else {
            Post.updateOne(
                { _id: req.params.id },
                {
                    title: req.body.title,
                    content: req.body.content,
                },
            )
                .then(() => res.redirect('/admin/quan-ly-bai-dang'))
                .catch(next);
        }
    }
    getListTrashPost(req, res, next) {
        Post.findDeleted({}).then((posts) => {
            console.log(posts);
            res.render('admin/post/trash-post', {
                posts: mutipleMongooseToObject(posts),
            });
        });
    }
    restorePost(req, res, next) {
        Post.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
    forceDestroyPost(req, res, next) {
        Post.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
    deletePost(req, res, next) {
        Post.delete({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
    getListPost(req, res, next) {
        Promise.all([Post.find({}), Post.countDocumentsDeleted({})])
            .then(([posts, deletedCount]) => res.render('admin/post/list-post', { posts: mutipleMongooseToObject(posts), deletedCount, cssPath: 'admin-post.css' }))
            .catch(next);
    }

    updateOrderStatus(req, res, next) {
        Order.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('/admin/quan-ly-don-hang'))
            .catch(next);
    }

    getListOrder(req, res, next) {
        Order.find({})
            .then((orders) =>
                res.render('admin/order', {
                    orders: mutipleMongooseToObject(orders),
                    cssPath: 'admin-order.css',
                }),
            )
            .catch(next);
    }

    async getListEvaluate(req, res, next) {
        try {
            const feedbackRatings = await Rating.find({ feedback: { $exists: true, $ne: null } })
                .populate({
                    path: 'productId',
                    populate: {
                        path: 'categoryId',
                        model: 'Category',
                    },
                })
                .populate('customerId');
            const notFeedbackRatings = await Rating.find({ feedback: { $exists: false } })
                .populate({
                    path: 'productId',
                    populate: {
                        path: 'categoryId',
                        model: 'Category',
                    },
                })
                .populate('customerId');
            console.log('Feedback Records:', feedbackRatings);
            console.log('Not Feedback Records:', notFeedbackRatings);

            res.render('admin/evaluate', {
                feedbackRatings: mutipleMongooseToObject(feedbackRatings),
                notFeedbackRatings: mutipleMongooseToObject(notFeedbackRatings),
            });
        } catch (error) {
            throw new Error('Error while fetching feedback status: ' + error.message);
        }
    }

    postReplyEvaluate(req, res, next) {
        Rating.updateOne({ _id: req.body.idRating }, { feedback: req.body.feedback })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    getStatistical(req, res, next) {
        const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        Promise.all([
            Order.aggregate([
                {
                    $project: {
                        month: { $substr: ['$createdAt', 5, 2] }, // Trích xuất thông tin tháng từ trường createdAt
                        totalMonney: 1, // Trường totalMonney (và các trường khác nếu cần)
                        orderStatus: 1,
                    },
                },
                {
                    $match: {
                        month: { $in: months }, // Thay "07" bằng tháng cần lấy dữ liệu
                        orderStatus: 'Hoàn thành',
                    },
                },
                {
                    $group: {
                        _id: '$month', // Nhóm các đơn hàng cùng tháng lại với nhau
                        totalTongTien: { $sum: '$totalMonney' }, // Tính tổng tiền của các đơn hàng trong mỗi tháng
                        totalDonHang: { $sum: 1 },
                    },
                },
                {
                    $sort: { _id: 1 }, // Sắp xếp theo thời gian tăng dần
                },
            ]),
            Order.aggregate([
                {
                    $match: {
                        orderStatus: 'Hoàn thành', // Lọc các đơn hàng có trạng thái là 'Hoàn thành'
                    },
                },
                {
                    $unwind: '$products', // Mở rộng mảng products thành từng bản ghi riêng lẻ
                },
                {
                    $group: {
                        _id: '$products.product', // Nhóm các sản phẩm cùng loại lại với nhau
                        totalSold: { $sum: '$products.quantity' }, // Tính tổng số lượng sản phẩm đã bán
                    },
                },
                {
                    $sort: { totalSold: -1 }, // Sắp xếp số lượng sản phẩm đã bán giảm dần
                },
                {
                    $limit: 10, // Chọn 10 sản phẩm bán chạy nhất
                },
            ]),
        ])

            .then(([ordersData, productData]) => {
                const totalTongTienArray = new Array(12).fill(0); // Tạo mảng có 12 phần tử và giá trị ban đầu là 0
                const totalDonHangArray = new Array(12).fill(0); // Tạo mảng có 12 phần tử và giá trị ban đầu là 0

                // Gán tổng tiền vào mảng totalTongTienArray tương ứng với tháng
                ordersData.forEach((item) => {
                    const index = parseInt(item._id, 10) - 1; // Ví dụ: tháng 01 -> index 0, tháng 02 -> index 1, ..., tháng 12 -> index 11
                    totalTongTienArray[index] = item.totalTongTien;
                    totalDonHangArray[index] = item.totalDonHang;
                });

                const productsData = []; // Tạo mảng chứa thông tin thống kê sản phẩm bán chạy
                // Gán thông tin của từng sản phẩm vào mảng productsData
                productData.forEach((item) => {
                    productsData.push({
                        name: item._id.name,
                        totalSold: item.totalSold,
                    });
                });

                res.render('admin/statistical', {
                    totalTongTien: JSON.stringify(totalTongTienArray), // Ví dụ số đơn hàng theo từng tháng
                    totalDonHang: JSON.stringify(totalDonHangArray), // Ví dụ số đơn hàng theo từng tháng
                    productsData: JSON.stringify(productsData),
                });
            })
            .catch();
    }

    getlListAccount(req, res, next) {
        User.find({ role: 'CUSTOMER' })
            .then((users) =>
                res.render('admin/account', {
                    users: mutipleMongooseToObject(users),
                }),
            )
            .catch(next);
    }
    lockAccount(req, res, next) {
        User.updateOne(
            { id: req.params.id },
            {
                lock: true,
            },
        )
            .then(() => res.redirect('/admin/quan-ly-tai-khoan'))
            .catch(next);
    }
    unlockAccount(req, res, next) {
        User.updateOne(
            { id: req.params.id },
            {
                lock: false,
            },
        )
            .then(() => res.redirect('/admin/quan-ly-tai-khoan'))
            .catch(next);
    }
}

module.exports = new AdminController();
