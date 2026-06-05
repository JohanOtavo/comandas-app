import axios from 'axios';

export const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  timeout: 15000
});

export function configureApiBaseUrl(baseUrl) {
  api.defaults.baseURL = baseUrl;
}

export function getApiBaseUrl() {
  return api.defaults.baseURL || DEFAULT_API_BASE_URL;
}

export function unwrap(response) {
  return response.data.data;
}

export function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Ocurrio un error inesperado';
}

export default api;
