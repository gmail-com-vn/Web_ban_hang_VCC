const adminRouter = require('./admin');
const siteRouter = require('./site');
const productRouter = require('./product');
const postRouter = require('./post');
function route(app) {
    app.use('/tin-tuc', postRouter);
    app.use('/admin', adminRouter);
    app.use('/san-pham', productRouter);
    app.use('/', siteRouter);
}

module.exports = route;
