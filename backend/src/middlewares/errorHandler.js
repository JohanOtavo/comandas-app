const ApiError = require('../utils/ApiError');

function errorHandler(error, req, res, next) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      ok: false,
      message: error.message,
      details: error.details
    });
  }

  if (error.code === 'P2002') {
    return res.status(409).json({
      ok: false,
      message: 'Ya existe un registro con esos datos',
      details: error.meta
    });
  }

  if (error.code === 'P2003') {
    return res.status(409).json({
      ok: false,
      message: 'No se puede eliminar porque el registro esta relacionado con otros datos',
      details: error.meta
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      ok: false,
      message: 'Registro no encontrado'
    });
  }

  console.error(error);

  return res.status(500).json({
    ok: false,
    message: 'Error interno del servidor'
  });
}

module.exports = errorHandler;
