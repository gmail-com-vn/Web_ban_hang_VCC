const { mutipleMongooseToObject, mongooseToObjiect } = require('../../util/mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Rating = require('../models/Rating');
class ProductController {
    getAllProduct(req, res, next) {
        Product.find({})
            .populate('categoryId')
            .then((products) => res.render('product/product-all', { products: mutipleMongooseToObject(products), cssPath: 'product.css' }))
            .catch(next);
    }
    getProduct(req, res, next) {
        Promise.all([
            Product.findOne({ slug: req.params.slug }).populate('categoryId'),
            Product.findOne({ slug: req.params.slug }).then((p) => {
                return Rating.find({ productId: p._id }).populate('customerId');
            }),
        ])
            .then(([product, ratings]) => {
                const star = ratings.map((r) => r.star);
                let total = 0;
                star.forEach((s) => {
                    total += s;
                });
                const totalStar = Math.round((total / ratings.length) * 10) / 10;
                console.log(totalStar), console.log(ratings);
                res.render('product/product-show', {
                    product: mongooseToObjiect(product),
                    ratings: mutipleMongooseToObject(ratings),
                    totalStar: totalStar,
                    cssPath: 'product.css',
                });
            })
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
                    cssPath: 'product.css',
                });
            })
            .catch(next);
    }
}

module.exports = new ProductController();
