const productService = require('../services/productService');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendSuccess } = require('../utils/response');

const list = asyncHandler(async (req, res) => {
  const products = await productService.listProducts(req.query);
  sendSuccess(res, products);
});

const detail = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.id);
  sendSuccess(res, product);
});

const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  sendSuccess(res, product, 'Producto creado', 201);
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  sendSuccess(res, product, 'Producto actualizado');
});

const changeStatus = asyncHandler(async (req, res) => {
  const product = await productService.setProductStatus(req.params.id, req.body);
  sendSuccess(res, product, 'Estado de producto actualizado');
});

const remove = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  sendSuccess(res, product, 'Producto eliminado');
});

module.exports = {
  list,
  detail,
  create,
  update,
  changeStatus,
  remove
};
