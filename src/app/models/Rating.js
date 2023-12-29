const mongoose = require('mongoose');

const Schema = mongoose.Schema;
ratingSchema = mongoose.Schema({
    star: { type: Number },
    customerId: { type: Schema.Types.ObjectId, ref: 'User' },
    productId: { type: Number, ref: 'Product' },
    // orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    comment: { type: String },
    imageRating: { type: String },
    feedback: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Rating', ratingSchema);
