import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { categoryService } from '../services/categoryService';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { colors, spacing } from '../styles/theme';
import { formatCurrency } from '../utils/format';
import { orderStatusColor, orderStatusLabel } from '../utils/status';

export default function AddOrderItemScreen({ route, navigation }) {
  const orderId = route.params?.orderId;
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedProduct = products.find((product) => product.id === selectedProductId);
  const isOpen = order?.status === 'OPEN';

  const load = useCallback(async () => {
    if (!orderId) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      const [orderData, productData, categoryData] = await Promise.all([
        orderService.detail(orderId),
        productService.list({ isActive: true }),
        categoryService.list({ isActive: true })
      ]);
      setOrder(orderData);
      setProducts(productData);
      setCategories(categoryData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !term || product.name.toLowerCase().includes(term);
      const matchesCategory = !categoryId || product.categoryId === categoryId;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryId]);

  async function addProduct() {
    if (!selectedProductId) {
      setError('Selecciona un producto');
      setSuccess('');
      return;
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      setError('No se pueden agregar productos con cantidad menor o igual a cero');
      setSuccess('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const updatedOrder = await orderService.addItem(orderId, {
        productId: selectedProductId,
        quantity: Number(quantity)
      });
      setOrder(updatedOrder);
      setQuantity('1');
      setSelectedProductId(null);
      setSuccess('Producto agregado a la comanda');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
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
        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>{order.name}</Text>
            <StatusBadge label={orderStatusLabel(order.status)} color={orderStatusColor(order.status)} />
          </View>
          <Row label="Total actual" value={formatCurrency(order.total)} strong />
        </Card>

        {!isOpen ? (
          <Card>
            <EmptyState
              title="Esta comanda no se puede editar"
              subtitle="Solo las comandas abiertas permiten agregar productos."
              icon="lock-closed-outline"
            />
            <AppButton
              title="Volver al detalle"
              icon="arrow-back-outline"
              variant="ghost"
              onPress={() => navigation.goBack()}
            />
          </Card>
        ) : (
          <>
            <Card>
              <Text style={styles.sectionTitle}>Buscar producto</Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {success ? <Text style={styles.success}>{success}</Text> : null}
              <InputField
                label="Nombre"
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por nombre"
              />
              <Text style={styles.label}>Categoria</Text>
              <View style={styles.chips}>
                <FilterChip label="Todas" selected={!categoryId} onPress={() => setCategoryId(null)} />
                {categories.map((category) => (
                  <FilterChip
                    key={category.id}
                    label={category.name}
                    selected={categoryId === category.id}
                    onPress={() => setCategoryId(category.id)}
                  />
                ))}
              </View>
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>Productos disponibles</Text>
              {visibleProducts.length === 0 ? (
                <EmptyState title="No hay productos activos" icon="fast-food-outline" />
              ) : null}
              {visibleProducts.map((product) => (
                <View key={product.id} style={styles.productRow}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.muted}>{product.category?.name || 'Sin categoria'}</Text>
                    <Text style={styles.price}>{formatCurrency(product.price)}</Text>
                  </View>
                  <AppButton
                    title={selectedProductId === product.id ? 'Elegido' : 'Elegir'}
                    icon={selectedProductId === product.id ? 'checkmark-outline' : 'add-outline'}
                    variant={selectedProductId === product.id ? 'success' : 'outline'}
                    compact
                    onPress={() => setSelectedProductId(product.id)}
                  />
                </View>
              ))}
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>Cantidad</Text>
              <Row label="Producto" value={selectedProduct?.name || 'Sin seleccionar'} />
              <InputField
                label="Cantidad"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="1"
              />
              <AppButton
                title="Agregar producto"
                icon="add-circle-outline"
                onPress={addProduct}
                loading={saving}
                disabled={!selectedProductId}
              />
              <AppButton
                title="Volver al detalle"
                icon="receipt-outline"
                variant="ghost"
                onPress={() => navigation.goBack()}
              />
            </Card>
          </>
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
  label: {
    color: colors.text,
    fontWeight: '800',
    marginBottom: spacing.sm
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm
  },
  productRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.md
  },
  productInfo: {
    marginBottom: spacing.sm
  },
  productName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900'
  },
  price: {
    color: colors.teal,
    fontWeight: '900',
    marginTop: spacing.xs
  },
  muted: {
    color: colors.muted
  },
  error: {
    color: colors.danger,
    fontWeight: '800',
    marginBottom: spacing.md
  },
  success: {
    color: colors.success,
    fontWeight: '800',
    marginBottom: spacing.md
  }
});
