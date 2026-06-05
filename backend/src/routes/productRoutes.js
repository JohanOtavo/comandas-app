const router = require('express').Router();
const productController = require('../controllers/productController');

router.get('/', productController.list);
router.get('/:id', productController.detail);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.patch('/:id/status', productController.changeStatus);
router.delete('/:id', productController.remove);

module.exports = router;
