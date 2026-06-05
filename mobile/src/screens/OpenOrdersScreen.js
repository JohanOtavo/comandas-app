import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import Row from '../components/Row';
import Screen from '../components/Screen';
import { getErrorMessage } from '../services/api';
import { orderService } from '../services/orderService';
import { colors, spacing } from '../styles/theme';
import { formatCurrency, formatDate } from '../utils/format';

export default function OpenOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      setOrders(await orderService.listOpen());
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

  function confirmPay(order) {
    Alert.alert(
      'Pagar comanda',
      `Confirmas el pago de "${order.name}" por ${formatCurrency(order.total)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar',
          onPress: async () => {
            try {
              await orderService.pay(order.id);
              await load();
            } catch (err) {
              setError(getErrorMessage(err));
            }
          }
        }
      ]
    );
  }

  function confirmDelete(order) {
    Alert.alert(
      'Eliminar comanda',
      `Deseas enviar "${order.name}" al historial de eliminadas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await orderService.remove(order.id, { deleteNote: 'Eliminada desde el listado de abiertas' });
              await load();
            } catch (err) {
              setError(getErrorMessage(err));
            }
          }
        }
      ]
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton
          title="Crear nueva comanda"
          icon="add-outline"
          onPress={() => navigation.navigate('CreateOrder')}
          style={styles.createButton}
        />
        {loading ? <LoadingState /> : null}
        {!loading && orders.length === 0 ? (
          <EmptyState title="No hay comandas abiertas" subtitle="Crea una comanda para empezar a vender." icon="receipt-outline" />
        ) : null}
        {orders.map((order) => (
          <Card key={order.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{order.name}</Text>
              <Text style={styles.total}>{formatCurrency(order.total)}</Text>
            </View>
            <Row label="Creada" value={formatDate(order.createdAt)} />
            <Row label="Productos agregados" value={order._count?.items || 0} />
            <View style={styles.actions}>
              <AppButton title="Detalle" icon="eye-outline" variant="outline" compact onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })} />
              <AppButton title="Pagar" icon="card-outline" variant="success" compact onPress={() => confirmPay(order)} />
              <AppButton title="Eliminar" icon="trash-outline" variant="danger" compact onPress={() => confirmDelete(order)} />
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  createButton: {
    marginBottom: spacing.md
  },
  error: {
    color: colors.danger,
    fontWeight: '700',
    marginBottom: spacing.md
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  itemTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    flex: 1,
    paddingRight: spacing.md
  },
  total: {
    color: colors.success,
    fontWeight: '900',
    fontSize: 17
  },
  actions: {
    marginTop: spacing.md
  }
});
