const router = require('express').Router();
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const cashRegisterRoutes = require('./cashRegisterRoutes');
const orderRoutes = require('./orderRoutes');

router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cash-register', cashRegisterRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
