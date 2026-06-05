function notFound(req, res) {
  return res.status(404).json({
    ok: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
}

module.exports = notFound;
