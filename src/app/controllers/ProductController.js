const { mutipleMongooseToObject, mongooseToObjiect } = require('../../util/mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
class ProductController {
    getAllProduct(req, res, next) {
        Product.find({})
            .populate('categoryId')
            .then((products) => res.render('product/product-all', { products: mutipleMongooseToObject(products) }))
            .catch(next);
    }
    getProduct(req, res, next) {
        Product.findOne({ slug: req.params.slug })
            .populate('categoryId')
            .then((product) => res.render('product/product-show', { product: mongooseToObjiect(product) }))
            .catch(next);
    }
    showCategory(req, res, next) {
        let categoryProduct;
        Category.findOne({ slug: req.params.slugCategory })
            .then((category) => {
                categoryProduct = category.categoryProduct;
                return Product.find({ categoryId: category._id }).populate('categoryId');
            })
            .then((products) => {
                res.render('product/product-category', {
                    products: mutipleMongooseToObject(products),
                    categoryProduct: categoryProduct,
                });
            })
            .catch(next);
    }
}

module.exports = new ProductController();
