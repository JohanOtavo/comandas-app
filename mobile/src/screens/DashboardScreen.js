import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../components/Card';
import LoadingState from '../components/LoadingState';
import Row from '../components/Row';
import Screen from '../components/Screen';
import StatusBadge from '../components/StatusBadge';
import { getErrorMessage } from '../services/api';
import { cashRegisterService } from '../services/cashRegisterService';
import { orderService } from '../services/orderService';
import { colors, radius, spacing } from '../styles/theme';
import { formatCurrency } from '../utils/format';

const quickActions = [
  { title: 'Categorias', icon: 'albums-outline', route: 'Categories', color: colors.primary },
  { title: 'Productos', icon: 'fast-food-outline', route: 'Products', color: colors.teal },
  { title: 'Caja', icon: 'cash-outline', route: 'CashRegister', color: colors.success },
  { title: 'Crear comanda', icon: 'add-circle-outline', route: 'CreateOrder', color: colors.warning },
  { title: 'Abiertas', icon: 'receipt-outline', route: 'OpenOrders', color: colors.primaryDark },
  { title: 'Pagadas', icon: 'checkmark-done-outline', route: 'PaidOrders', color: colors.success },
  { title: 'Eliminadas', icon: 'trash-outline', route: 'DeletedOrders', color: colors.danger }
];

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cashRegister, setCashRegister] = useState(null);
  const [openOrders, setOpenOrders] = useState([]);

  const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const [currentCash, orders] = await Promise.all([
        cashRegisterService.current(),
        orderService.listOpen()
      ]);
      setCashRegister(currentCash);
      setOpenOrders(orders);
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

  if (loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Panel del negocio</Text>
          <Text style={styles.subtitle}>Gestiona menu, caja y comandas desde un solo lugar.</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Card>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Caja actual</Text>
            <StatusBadge
              label={cashRegister ? 'Abierta' : 'Cerrada'}
              color={cashRegister ? colors.success : colors.muted}
            />
          </View>
          <Row
            label="Total vendido"
            value={formatCurrency(cashRegister?.totalSales)}
            strong
          />
          <Row label="Comandas abiertas" value={openOrders.length} />
        </Card>

        <View style={styles.grid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.route}
              activeOpacity={0.86}
              style={styles.action}
              onPress={() => navigation.navigate(action.route)}
            >
              <View style={[styles.iconBox, { backgroundColor: `${action.color}18` }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900'
  },
  subtitle: {
    color: colors.muted,
    marginTop: spacing.xs,
    fontSize: 15
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontWeight: '700'
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs
  },
  action: {
    width: '50%',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md
  },
  iconBox: {
    minHeight: 104,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionText: {
    color: colors.text,
    fontWeight: '800',
    marginTop: spacing.sm,
    textAlign: 'center'
  }
});
