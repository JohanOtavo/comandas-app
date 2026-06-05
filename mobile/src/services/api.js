import axios from 'axios';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://inmero.co/comandas/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

export function unwrap(response) {
  return response.data.data;
}

export function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Ocurrio un error inesperado';
}

export default api;
