import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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

export default function PaidOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      setOrders(await orderService.listPaid());
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

  const visibleOrders = orders.filter((order) =>
    order.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Card>
          <InputField label="Buscar" placeholder="Nombre de la comanda" value={search} onChangeText={setSearch} />
        </Card>
        {loading ? <LoadingState /> : null}
        {!loading && visibleOrders.length === 0 ? (
          <EmptyState title="No hay comandas pagadas" icon="checkmark-done-outline" />
        ) : null}
        {visibleOrders.map((order) => (
          <Card key={order.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{order.name}</Text>
              <Text style={styles.total}>{formatCurrency(order.total)}</Text>
            </View>
            <Row label="Creada" value={formatDate(order.createdAt)} />
            <Row label="Pagada" value={formatDate(order.paidAt)} />
            <Row label="Caja" value={order.cashRegisterId ? `#${order.cashRegisterId}` : 'Sin caja'} />
            <AppButton
              title="Ver detalle"
              icon="eye-outline"
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
  }
});
