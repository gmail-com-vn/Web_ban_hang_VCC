const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    categoryProduct: { type: String },
    slug: { type: String, slug: 'categoryProduct', unique: true },
});

mongoose.plugin(slug);

module.exports = mongoose.model('Category', categorySchema);
