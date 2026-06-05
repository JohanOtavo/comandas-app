import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import FilterChip from '../components/FilterChip';
import InputField from '../components/InputField';
import LoadingState from '../components/LoadingState';
import Row from '../components/Row';
import Screen from '../components/Screen';
import StatusBadge from '../components/StatusBadge';
import { getErrorMessage } from '../services/api';
import { orderService } from '../services/orderService';
import { colors, spacing } from '../styles/theme';
import { formatCurrency, formatDate } from '../utils/format';
import { orderStatusColor, orderStatusLabel } from '../utils/status';

export default function OrderDetailScreen({ route, navigation }) {
  const orderId = route.params?.orderId;
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [viewMode, setViewMode] = useState('added');
  const [name, setName] = useState('');
  const [deleteNote, setDeleteNote] = useState('');
  const [itemQuantities, setItemQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isOpen = order?.status === 'OPEN';

  const load = useCallback(async () => {
    if (!orderId) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      const [orderData, itemData] = await Promise.all([
        orderService.detail(orderId),
        orderService.listItems(orderId, viewMode)
      ]);
      setOrder(orderData);
      setName(orderData.name);
      setItems(itemData);

      const quantities = {};
      itemData.forEach((item) => {
        if (item.id) {
          quantities[item.id] = String(item.quantity);
        }
      });
      setItemQuantities(quantities);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [orderId, viewMode]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function refreshOrder() {
    const [orderData, itemData] = await Promise.all([
      orderService.detail(orderId),
      orderService.listItems(orderId, viewMode)
    ]);
    setOrder(orderData);
    setName(orderData.name);
    setItems(itemData);

    const quantities = {};
    itemData.forEach((item) => {
      if (item.id) {
        quantities[item.id] = String(item.quantity);
      }
    });
    setItemQuantities(quantities);
  }

  async function saveName() {
    if (!name.trim()) {
      setError('No se pueden crear comandas sin nombre');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await orderService.update(orderId, { name });
      await refreshOrder();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveItemQuantity(item) {
    const nextQuantity = Number(itemQuantities[item.id]);

    if (!Number.isInteger(nextQuantity) || nextQuantity <= 0) {
      setError('La cantidad debe ser mayor a cero');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await orderService.updateItem(orderId, item.id, { quantity: nextQuantity });
      await refreshOrder();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function confirmRemoveItem(item) {
    Alert.alert(
      'Retirar producto',
      `Deseas retirar "${item.productNameSnapshot}" de esta comanda?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Retirar',
          style: 'destructive',
          onPress: async () => {
            try {
              setError('');
              await orderService.removeItem(orderId, item.id);
              await refreshOrder();
            } catch (err) {
              setError(getErrorMessage(err));
            }
          }
        }
      ]
    );
  }

  function confirmPay() {
    Alert.alert(
      'Pagar comanda',
      `Confirmas el pago por ${formatCurrency(order?.total)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar',
          onPress: async () => {
            try {
              setSaving(true);
              setError('');
              await orderService.pay(orderId);
              await refreshOrder();
            } catch (err) {
              setError(getErrorMessage(err));
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  }

  function confirmDelete() {
    Alert.alert(
      'Eliminar comanda',
      'La comanda pasara al modulo de eliminadas y conservara su detalle.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              setError('');
              await orderService.remove(orderId, { deleteNote });
              await refreshOrder();
            } catch (err) {
              setError(getErrorMessage(err));
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  }

  if (loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <EmptyState title="Comanda no encontrada" icon="alert-circle-outline" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>{order.name}</Text>
            <StatusBadge label={orderStatusLabel(order.status)} color={orderStatusColor(order.status)} />
          </View>
          <Row label="Creada" value={formatDate(order.createdAt)} />
          <Row label="Pagada" value={formatDate(order.paidAt)} />
          <Row label="Eliminada" value={formatDate(order.deletedAt)} />
          <Row label="Total general" value={formatCurrency(order.total)} strong />
          {order.cashRegisterId ? <Row label="Caja asociada" value={`#${order.cashRegisterId}`} /> : null}
        </Card>

        {isOpen ? (
          <Card>
            <Text style={styles.sectionTitle}>Editar comanda</Text>
            <InputField
              label="Nombre"
              value={name}
              onChangeText={setName}
              placeholder="Nombre de la comanda"
            />
            <AppButton title="Guardar nombre" icon="save-outline" variant="outline" onPress={saveName} loading={saving} />
          </Card>
        ) : null}

        {isOpen ? (
          <Card>
            <View style={styles.addHeader}>
              <View style={styles.addTextBox}>
                <Text style={styles.sectionTitle}>Productos</Text>
                <Text style={styles.muted}>Agrega nuevos productos desde una vista separada.</Text>
              </View>
              <AppButton
                title="+"
                icon="add-outline"
                compact
                onPress={() => navigation.navigate('AddOrderItem', { orderId })}
                style={styles.plusButton}
              />
            </View>
            <AppButton
              title="Agregar producto"
              icon="add-circle-outline"
              onPress={() => navigation.navigate('AddOrderItem', { orderId })}
            />
          </Card>
        ) : null}

        <Card>
          <Text style={styles.sectionTitle}>Productos de la comanda</Text>
          <View style={styles.chips}>
            <FilterChip label="Orden de agregado" selected={viewMode === 'added'} onPress={() => setViewMode('added')} />
            <FilterChip label="Agrupado" selected={viewMode === 'grouped'} onPress={() => setViewMode('grouped')} />
          </View>

          {items.length === 0 ? (
            <EmptyState title="No hay productos agregados" icon="basket-outline" />
          ) : null}

          {items.map((item) => (
            <View key={item.id || `${item.productId}-${item.firstAddedOrder}`} style={styles.itemBox}>
              <View style={styles.rowBetween}>
                <View style={styles.itemNameBox}>
                  <Text style={styles.itemTitle}>{item.productNameSnapshot}</Text>
                  <Text style={styles.muted}>{formatCurrency(item.productPriceSnapshot)} c/u</Text>
                </View>
                <Text style={styles.itemTotal}>{formatCurrency(item.subtotal)}</Text>
              </View>
              <Row label="Cantidad" value={item.quantity} />
              {viewMode === 'added' && isOpen ? (
                <View style={styles.itemActions}>
                  <InputField
                    label="Nueva cantidad"
                    value={itemQuantities[item.id] || ''}
                    onChangeText={(value) =>
                      setItemQuantities((current) => ({ ...current, [item.id]: value }))
                    }
                    keyboardType="numeric"
                  />
                  <AppButton title="Actualizar" icon="refresh-outline" variant="outline" compact onPress={() => saveItemQuantity(item)} loading={saving} />
                  <AppButton title="Retirar" icon="remove-circle-outline" variant="danger" compact onPress={() => confirmRemoveItem(item)} />
                </View>
              ) : null}
            </View>
          ))}
        </Card>

        {isOpen ? (
          <Card>
            <Text style={styles.sectionTitle}>Acciones</Text>
            <AppButton title="Pagar comanda" icon="card-outline" variant="success" onPress={confirmPay} loading={saving} />
            <InputField
              label="Observacion de eliminacion"
              value={deleteNote}
              onChangeText={setDeleteNote}
              placeholder="Opcional"
              multiline
            />
            <AppButton title="Eliminar comanda" icon="trash-outline" variant="danger" onPress={confirmDelete} loading={saving} />
          </Card>
        ) : (
          <Card>
            <Text style={styles.sectionTitle}>Registro cerrado</Text>
            <Text style={styles.muted}>
              Las comandas pagadas o eliminadas conservan su detalle y no se pueden editar.
            </Text>
            <AppButton title="Volver al inicio" icon="home-outline" variant="ghost" onPress={() => navigation.navigate('Dashboard')} />
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    flex: 1,
    paddingRight: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: spacing.md
  },
  error: {
    color: colors.danger,
    fontWeight: '700',
    marginBottom: spacing.md
  },
  muted: {
    color: colors.muted
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md
  },
  addHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  addTextBox: {
    flex: 1,
    paddingRight: spacing.md
  },
  plusButton: {
    minWidth: 48,
    marginTop: 0
  },
  itemBox: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.md
  },
  itemNameBox: {
    flex: 1,
    paddingRight: spacing.md
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900'
  },
  itemTotal: {
    color: colors.success,
    fontWeight: '900',
    fontSize: 16
  },
  itemActions: {
    marginTop: spacing.md
  }
});
