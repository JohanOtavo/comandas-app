const router = require('express').Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.list);
router.get('/:id', categoryController.detail);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.patch('/:id/status', categoryController.changeStatus);
router.delete('/:id', categoryController.remove);

module.exports = router;
