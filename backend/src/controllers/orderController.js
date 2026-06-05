const orderService = require('../services/orderService');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendSuccess } = require('../utils/response');

const listOpen = asyncHandler(async (req, res) => {
  const orders = await orderService.listOrdersByStatus('OPEN', req.query);
  sendSuccess(res, orders);
});

const listPaid = asyncHandler(async (req, res) => {
  const orders = await orderService.listOrdersByStatus('PAID', req.query);
  sendSuccess(res, orders);
});

const listDeleted = asyncHandler(async (req, res) => {
  const orders = await orderService.listOrdersByStatus('DELETED', req.query);
  sendSuccess(res, orders);
});

const detail = asyncHandler(async (req, res) => {
  const order = await orderService.getOrder(req.params.id);
  sendSuccess(res, order);
});

const create = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  sendSuccess(res, order, 'Comanda creada', 201);
});

const update = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrder(req.params.id, req.body);
  sendSuccess(res, order, 'Comanda actualizada');
});

const pay = asyncHandler(async (req, res) => {
  const order = await orderService.payOrder(req.params.id);
  sendSuccess(res, order, 'Comanda pagada');
});

const softDelete = asyncHandler(async (req, res) => {
  const order = await orderService.deleteOrder(req.params.id, req.body);
  sendSuccess(res, order, 'Comanda eliminada');
});

const listItems = asyncHandler(async (req, res) => {
  const items = await orderService.getOrderItems(req.params.id, req.query);
  sendSuccess(res, items);
});

const detailItem = asyncHandler(async (req, res) => {
  const item = await orderService.getOrderItem(req.params.id, req.params.itemId);
  sendSuccess(res, item);
});

const addItem = asyncHandler(async (req, res) => {
  const order = await orderService.addOrderItem(req.params.id, req.body);
  sendSuccess(res, order, 'Producto agregado a la comanda', 201);
});

const updateItem = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderItem(req.params.id, req.params.itemId, req.body);
  sendSuccess(res, order, 'Producto de comanda actualizado');
});

const removeItem = asyncHandler(async (req, res) => {
  const order = await orderService.deleteOrderItem(req.params.id, req.params.itemId);
  sendSuccess(res, order, 'Producto retirado de la comanda');
});

module.exports = {
  listOpen,
  listPaid,
  listDeleted,
  detail,
  create,
  update,
  pay,
  softDelete,
  listItems,
  detailItem,
  addItem,
  updateItem,
  removeItem
};
