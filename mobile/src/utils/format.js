export function formatCurrency(value) {
  const number = Number(value || 0);

  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(number);
  } catch (error) {
    return `$${Math.round(number).toLocaleString('es-CO')}`;
  }
}

export function formatDate(value) {
  if (!value) {
    return 'Sin fecha';
  }

  try {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch (error) {
    return String(value);
  }
}

export function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}
