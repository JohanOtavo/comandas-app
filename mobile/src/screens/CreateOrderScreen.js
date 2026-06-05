import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import AppButton from '../components/AppButton';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import InputField from '../components/InputField';
import LoadingState from '../components/LoadingState';
import Row from '../components/Row';
import Screen from '../components/Screen';
import { getErrorMessage } from '../services/api';
import { orderService } from '../services/orderService';
import { colors, spacing } from '../styles/theme';
import { formatCurrency, formatDate } from '../utils/format';

export default function CreateOrderScreen({ navigation }) {
  const [name, setName] = useState('');
  const [openOrders, setOpenOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      setOpenOrders(await orderService.listOpen());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function createOrder() {
    if (!name.trim()) {
      setError('No se pueden crear comandas sin nombre');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const order = await orderService.create({ name });
      setName('');
      navigation.navigate('AddOrderItem', { orderId: order.id });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.title}>Nueva comanda</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <InputField
            label="Nombre de la comanda"
            placeholder="Ej. Mesa 1, Pedido Juan, Domicilio Ana"
            value={name}
            onChangeText={setName}
          />
          <AppButton title="Crear y agregar productos" icon="add-circle-outline" onPress={createOrder} loading={saving} />
        </Card>

        <Text style={styles.listTitle}>Comandas abiertas recientes</Text>
        {loading ? <LoadingState /> : null}
        {!loading && openOrders.length === 0 ? (
          <EmptyState title="No hay comandas abiertas" icon="receipt-outline" />
        ) : null}
        {openOrders.map((order) => (
          <Card key={order.id}>
            <Text style={styles.itemTitle}>{order.name}</Text>
            <Row label="Creada" value={formatDate(order.createdAt)} />
            <Row label="Productos" value={order._count?.items || 0} />
            <Row label="Total" value={formatCurrency(order.total)} strong />
            <AppButton
              title="Abrir detalle"
              icon="arrow-forward-outline"
              variant="outline"
              compact
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
            />
          </Card>
        ))}
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
  listTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: spacing.md
  },
  itemTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 18
  },
  error: {
    color: colors.danger,
    fontWeight: '700',
    marginBottom: spacing.md
  }
});
