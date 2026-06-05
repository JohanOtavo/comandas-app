import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_API_BASE_URL, configureApiBaseUrl } from '../services/api';

const STORAGE_KEY = 'comandas_api_base_url';
const ApiConfigContext = createContext(null);

export function normalizeApiBaseUrl(value) {
  const rawValue = String(value || '').trim();

  if (!rawValue) {
    throw new Error('Escribe la IP o URL del backend');
  }

  const protocolMatch = rawValue.match(/^(https?:\/\/)/i);
  const protocol = protocolMatch ? protocolMatch[1].toLowerCase() : 'http://';
  const withoutProtocol = rawValue
    .replace(/^(https?:\/\/)/i, '')
    .split(/[?#]/)[0]
    .replace(/\/+$/, '');
  const parts = withoutProtocol.split('/');
  const hostValue = parts.shift();

  if (!hostValue) {
    throw new Error('Escribe una IP o URL valida');
  }

  const host = hostValue.includes(':') ? hostValue : `${hostValue}:3000`;
  let pathname = parts.length ? `/${parts.join('/')}` : '/api';
  pathname = pathname.replace(/\/+$/, '') || '/api';

  if (!pathname.toLowerCase().endsWith('/api')) {
    pathname = `${pathname}/api`;
  }

  pathname = pathname.replace(/\/+/g, '/');

  return `${protocol}${host}${pathname}`;
}

export function getHealthUrl(apiBaseUrl) {
  return normalizeApiBaseUrl(apiBaseUrl).replace(/\/api$/, '/health');
}

export function ApiConfigProvider({ children }) {
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE_URL);
  const [isApiConfigReady, setIsApiConfigReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadStoredUrl() {
      try {
        const storedUrl = await AsyncStorage.getItem(STORAGE_KEY);
        const nextUrl = storedUrl || DEFAULT_API_BASE_URL;
        configureApiBaseUrl(nextUrl);

        if (mounted) {
          setApiBaseUrl(nextUrl);
        }
      } finally {
        if (mounted) {
          setIsApiConfigReady(true);
        }
      }
    }

    loadStoredUrl();

    return () => {
      mounted = false;
    };
  }, []);

  async function saveApiBaseUrl(value) {
    const nextUrl = normalizeApiBaseUrl(value);
    await AsyncStorage.setItem(STORAGE_KEY, nextUrl);
    configureApiBaseUrl(nextUrl);
    setApiBaseUrl(nextUrl);
    return nextUrl;
  }

  async function resetApiBaseUrl() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    configureApiBaseUrl(DEFAULT_API_BASE_URL);
    setApiBaseUrl(DEFAULT_API_BASE_URL);
    return DEFAULT_API_BASE_URL;
  }

  const value = useMemo(
    () => ({
      apiBaseUrl,
      defaultApiBaseUrl: DEFAULT_API_BASE_URL,
      isApiConfigReady,
      saveApiBaseUrl,
      resetApiBaseUrl
    }),
    [apiBaseUrl, isApiConfigReady]
  );

  return <ApiConfigContext.Provider value={value}>{children}</ApiConfigContext.Provider>;
}

export function useApiConfig() {
  const context = useContext(ApiConfigContext);

  if (!context) {
    throw new Error('useApiConfig debe usarse dentro de ApiConfigProvider');
  }

  return context;
}
