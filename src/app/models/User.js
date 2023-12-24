const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: { type: String, require: true },
    lastname: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require: true },
    phone: { type: String },
    address: { type: String },
    resetToken: String,
    resetTokenExpiration: Date,
    role: { type: String },
    avatar: { type: String },
    lock: { type: Boolean },
    cart: {
        items: [
            {
                productId: { type: Number, ref: 'Product', required: true },
                quantity: { type: Number },
            },
        ],
    },
    createdAt: { type: Date, default: Date.now },
});

userSchema.methods.addToCart = function (product, quantity) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
        return cp.productId.toString() === product._id.toString(); // lấy chỉ mục sản phẩm
    });

    let newQuantity = Number(quantity);
    const updatedCartItems = [...this.cart.items]; // kiểm soát số lượng và cập nhật giỏ hàng

    // cập nhật mảng
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + newQuantity;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            quantity: newQuantity,
            productId: product._id,
        });
    }
    const updatedCart = {
        items: updatedCartItems,
    };
    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter((item) => {
        return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
