const router = require('express').Router();
const cashRegisterController = require('../controllers/cashRegisterController');

router.post('/open', cashRegisterController.open);
router.get('/current', cashRegisterController.current);
router.get('/history', cashRegisterController.history);
router.post('/close', cashRegisterController.close);
router.get('/:id', cashRegisterController.detail);
router.put('/:id', cashRegisterController.update);

module.exports = router;
