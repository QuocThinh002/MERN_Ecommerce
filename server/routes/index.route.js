const userRouter = require('./user.route');
// const productRouter = require('./product.route');
// const productCategoryRouter = require('./productCategory.route');
// const orderRouter = require('./order.route');

const apiRoutes = (app) => {
    const domain = `/api/v1`;
    app.use(domain + '/user', userRouter);
    // app.use('/api/product', productRouter);
    // app.use('/api/product-category', productCategoryRouter);
    // app.use('/api/order', orderRouter);

    // app.use(notFound);
}

module.exports = apiRoutes;