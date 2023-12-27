const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudinary = require('cloudinary').v2;

const { mongooseToObjiect } = require('../../util/mongoose');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { Promise } = require('mongoose');
const Post = require('../models/Post');

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
                    cssPath: 'create-product.css',
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
            });

            await newProduct.save();
            res.status(201).json({ message: 'Product created successfully!' });
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
            .then(([products, deletedCount]) => res.render('admin/product/list-product', { products: mutipleMongooseToObject(products), deletedCount }))
            .catch(next);
    }

    getCreateCategory(req, res, next) {
        res.render('admin/category/create-category', { cssPath: 'create-category.css' });
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
                }),
            )
            .catch(next);
    }
    getEditCategory(req, res, next) {
        Category.findById(req.params.id)
            .then((category) =>
                res.render('admin/category/edit-category', {
                    category: mongooseToObjiect(category),
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
        res.render('admin/post/create-post', { cssPath: 'create-post.css' });
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
            .then((post) => res.render('admin/post/edit-post', { post: mongooseToObjiect(post), cssPath: 'create-post.css' }))
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
            .then(([posts, deletedCount]) => res.render('admin/post/list-post', { posts: mutipleMongooseToObject(posts), deletedCount }))
            .catch(next);
    }
}

module.exports = new AdminController();
