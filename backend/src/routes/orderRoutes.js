const router = require('express').Router();
const orderController = require('../controllers/orderController');

router.get('/open', orderController.listOpen);
router.get('/paid', orderController.listPaid);
router.get('/deleted', orderController.listDeleted);
router.post('/', orderController.create);
router.get('/:id/items', orderController.listItems);
router.post('/:id/items', orderController.addItem);
router.get('/:id/items/:itemId', orderController.detailItem);
router.put('/:id/items/:itemId', orderController.updateItem);
router.delete('/:id/items/:itemId', orderController.removeItem);
router.get('/:id', orderController.detail);
router.put('/:id', orderController.update);
router.post('/:id/pay', orderController.pay);
router.post('/:id/delete', orderController.softDelete);

module.exports = router;
