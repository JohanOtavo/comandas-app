import { colors } from '../styles/theme';

export function orderStatusLabel(status) {
  const labels = {
    OPEN: 'Abierta',
    PAID: 'Pagada',
    DELETED: 'Eliminada'
  };

  return labels[status] || status;
}

export function orderStatusColor(status) {
  const palette = {
    OPEN: colors.primary,
    PAID: colors.success,
    DELETED: colors.danger
  };

  return palette[status] || colors.muted;
}

export function cashStatusLabel(status) {
  return status === 'OPEN' ? 'Abierta' : 'Cerrada';
}

export function activeLabel(value) {
  return value ? 'Activo' : 'Inactivo';
}

export function activeColor(value) {
  return value ? colors.success : colors.muted;
}
