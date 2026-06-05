import axios from 'axios';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import AppButton from '../components/AppButton';
import Card from '../components/Card';
import InputField from '../components/InputField';
import Row from '../components/Row';
import Screen from '../components/Screen';
import StatusBadge from '../components/StatusBadge';
import {
  getHealthUrl,
  normalizeApiBaseUrl,
  useApiConfig
} from '../context/ApiConfigContext';
import { colors, spacing } from '../styles/theme';

function toEditableValue(apiBaseUrl) {
  return String(apiBaseUrl || '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/api\/?$/i, '');
}

export default function ConnectionScreen({ navigation }) {
  const { apiBaseUrl, defaultApiBaseUrl, saveApiBaseUrl, resetApiBaseUrl } = useApiConfig();
  const [serverValue, setServerValue] = useState(toEditableValue(apiBaseUrl));
  const [normalizedUrl, setNormalizedUrl] = useState(apiBaseUrl);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setServerValue(toEditableValue(apiBaseUrl));
    setNormalizedUrl(apiBaseUrl);
  }, [apiBaseUrl]);

  function previewUrl(value) {
    try {
      const nextUrl = normalizeApiBaseUrl(value);
      setNormalizedUrl(nextUrl);
      setMessage('');
      return nextUrl;
    } catch (error) {
      setMessage(error.message);
      return null;
    }
  }

  async function testConnection(value = serverValue) {
    const nextUrl = previewUrl(value);

    if (!nextUrl) {
      setStatus('error');
      return false;
    }

    try {
      setTesting(true);
      setMessage('');
      const response = await axios.get(getHealthUrl(nextUrl), { timeout: 8000 });
      const ok = response.data?.ok === true;

      if (!ok) {
        throw new Error('El backend respondio, pero no devolvio OK');
      }

      setStatus('ok');
      setMessage('Conexion correcta');
      return true;
    } catch (error) {
      setStatus('error');
      setMessage('No se pudo conectar con el backend');
      return false;
    } finally {
      setTesting(false);
    }
  }

  async function saveConnection() {
    const nextUrl = previewUrl(serverValue);

    if (!nextUrl) {
      setStatus('error');
      return;
    }

    try {
      setSaving(true);
      await saveApiBaseUrl(nextUrl);
      setStatus('ok');
      setMessage('Servidor guardado');
      Alert.alert('Conexion guardada', nextUrl, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Dashboard')
        }
      ]);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'No se pudo guardar la conexion');
    } finally {
      setSaving(false);
    }
  }

  async function restoreDefault() {
    const nextUrl = await resetApiBaseUrl();
    setServerValue(toEditableValue(nextUrl));
    setNormalizedUrl(nextUrl);
    setStatus(null);
    setMessage('Servidor restaurado');
  }

  const badge =
    status === 'ok' ? (
      <StatusBadge label="Conectado" color={colors.success} />
    ) : status === 'error' ? (
      <StatusBadge label="Sin conexion" color={colors.danger} />
    ) : (
      <StatusBadge label="Sin probar" color={colors.muted} />
    );

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.title}>Conexion del backend</Text>
          {badge}
          <Row label="Servidor actual" value={apiBaseUrl} />
          <Row label="Servidor base" value={defaultApiBaseUrl} />
        </Card>

        <Card>
          <InputField
            label="IP o URL"
            placeholder="192.168.0.27:3000"
            value={serverValue}
            onChangeText={(value) => {
              setServerValue(value);
              previewUrl(value);
              setStatus(null);
            }}
            autoCapitalize="none"
          />
          <Row label="URL API" value={normalizedUrl} />
          <Row label="Prueba" value={getHealthUrl(normalizedUrl)} />
          {message ? (
            <Text style={[styles.message, status === 'error' && styles.error]}>{message}</Text>
          ) : null}
          <AppButton
            title="Probar conexion"
            icon="wifi-outline"
            variant="outline"
            onPress={() => testConnection()}
            loading={testing}
          />
          <AppButton
            title="Guardar servidor"
            icon="save-outline"
            variant="success"
            onPress={saveConnection}
            loading={saving}
          />
          <AppButton
            title="Restaurar servidor"
            icon="refresh-outline"
            variant="ghost"
            onPress={restoreDefault}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: spacing.md
  },
  message: {
    color: colors.success,
    fontWeight: '800',
    marginTop: spacing.md
  },
  error: {
    color: colors.danger
  }
});
