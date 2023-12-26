const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudinary = require('cloudinary').v2;

const { mongooseToObjiect } = require('../../util/mongoose');
const { mutipleMongooseToObject } = require('../../util/mongoose');

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: 'dlkm9tiem',
    api_key: '778982786272933',
    api_secret: 'fTrhzosPAPmkI__Lj6qcyPljDeQ',
});

class AdminController {
    getCreateProduct(req, res, next) {
        res.render('admin/create-product', { cssPath: 'create-product.css' });
    }

    async postCreateProduct(req, res, next) {
        try {
            let imagePaths = [];
            console.log(req.body);

            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path);
                console.log(result.secure_url);
                imagePaths.push(result.secure_url);
            }
            console.log(imagePaths);

            const newProduct = new Product({
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                imageProduct: imagePaths,
            });

            await newProduct.save();
            res.status(201).json({ message: 'Product created successfully!' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
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
