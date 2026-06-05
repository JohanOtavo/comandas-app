const ApiError = require('./ApiError');

function parseId(value, fieldName = 'id') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, `${fieldName} invalido`);
  }
  return id;
}

function requiredString(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, `${fieldName} es obligatorio`);
  }
  return value.trim();
}

function optionalString(value) {
  if (value === undefined || value === null) {
    return null;
  }
  return String(value).trim() || null;
}

function nonNegativeNumber(value, fieldName) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new ApiError(400, `${fieldName} debe ser un numero mayor o igual a cero`);
  }
  return number;
}

function positiveNumber(value, fieldName) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw new ApiError(400, `${fieldName} debe ser un numero mayor a cero`);
  }
  return number;
}

function positiveInteger(value, fieldName) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new ApiError(400, `${fieldName} debe ser un entero mayor a cero`);
  }
  return number;
}

function booleanValue(value, fieldName) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  throw new ApiError(400, `${fieldName} debe ser verdadero o falso`);
}

function optionalBoolean(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return booleanValue(value, 'isActive');
}

module.exports = {
  parseId,
  requiredString,
  optionalString,
  nonNegativeNumber,
  positiveNumber,
  positiveInteger,
  booleanValue,
  optionalBoolean
};
