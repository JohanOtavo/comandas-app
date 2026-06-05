const categoryService = require('../services/categoryService');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendSuccess } = require('../utils/response');

const list = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories(req.query);
  sendSuccess(res, categories);
});

const detail = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategory(req.params.id);
  sendSuccess(res, category);
});

const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  sendSuccess(res, category, 'Categoria creada', 201);
});

const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  sendSuccess(res, category, 'Categoria actualizada');
});

const changeStatus = asyncHandler(async (req, res) => {
  const category = await categoryService.setCategoryStatus(req.params.id, req.body);
  sendSuccess(res, category, 'Estado de categoria actualizado');
});

const remove = asyncHandler(async (req, res) => {
  const category = await categoryService.deleteCategory(req.params.id);
  sendSuccess(res, category, 'Categoria eliminada');
});

module.exports = {
  list,
  detail,
  create,
  update,
  changeStatus,
  remove
};
