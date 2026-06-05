const cashRegisterService = require('../services/cashRegisterService');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendSuccess } = require('../utils/response');

const open = asyncHandler(async (req, res) => {
  const cashRegister = await cashRegisterService.openCashRegister(req.body);
  sendSuccess(res, cashRegister, 'Caja abierta', 201);
});

const current = asyncHandler(async (req, res) => {
  const cashRegister = await cashRegisterService.getCurrentCashRegister();
  sendSuccess(res, cashRegister, cashRegister ? 'Caja abierta encontrada' : 'No hay caja abierta');
});

const history = asyncHandler(async (req, res) => {
  const cashRegisters = await cashRegisterService.listCashRegisterHistory();
  sendSuccess(res, cashRegisters);
});

const detail = asyncHandler(async (req, res) => {
  const cashRegister = await cashRegisterService.getCashRegister(req.params.id);
  sendSuccess(res, cashRegister);
});

const update = asyncHandler(async (req, res) => {
  const cashRegister = await cashRegisterService.updateCashRegister(req.params.id, req.body);
  sendSuccess(res, cashRegister, 'Caja actualizada');
});

const close = asyncHandler(async (req, res) => {
  const cashRegister = await cashRegisterService.closeCashRegister(req.body);
  sendSuccess(res, cashRegister, 'Caja cerrada');
});

module.exports = {
  open,
  current,
  history,
  detail,
  update,
  close
};
