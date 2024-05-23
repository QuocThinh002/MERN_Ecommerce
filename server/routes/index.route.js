const userRouter = require('./user.route');
const productRouter = require('./product.route');
const authRouter = require('./auth.route');
// const productCategoryRouter = require('./productCategory.route');
// const orderRouter = require('./order.route');

const apiRoutes = (app) => {
    const domain = `/api/v1`;

    app.use(domain + '/auth', authRouter);
    app.use(domain + '/users', userRouter);
    app.use(domain + 'products', productRouter);
    // app.use('/api/product-category', productCategoryRouter);
    // app.use('/api/order', orderRouter);

    // app.use(notFound);
}

module.exports = apiRoutes;