function sendSuccess(res, data, message = 'Operacion exitosa', statusCode = 200) {
  return res.status(statusCode).json({
    ok: true,
    message,
    data
  });
}

module.exports = { sendSuccess };
