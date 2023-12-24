const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

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
}

module.exports = new AdminController();
