const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudinary = require('cloudinary').v2;

const { mongooseToObjiect } = require('../../util/mongoose');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { Promise } = require('mongoose');

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
                res.render('admin/create-product', {
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
                res.render('admin/edit-product', {
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

        console.log(imagePaths);
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
                res.render('admin/trash-product', {
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
            .then(([products, deletedCount]) => res.render('admin/list-product', { products: mutipleMongooseToObject(products), deletedCount }))
            .catch(next);
    }

    getCreateCategory(req, res, next) {
        res.render('admin/create-category', { cssPath: 'create-category.css' });
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
                res.render('admin/list-category', {
                    categories: mutipleMongooseToObject(categories),
                }),
            )
            .catch(next);
    }
    getEditCategory(req, res, next) {
        Category.findById(req.params.id)
            .then((category) =>
                res.render('admin/edit-category', {
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
}

module.exports = new AdminController();
