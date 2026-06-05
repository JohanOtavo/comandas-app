import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
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
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { colors, spacing } from '../styles/theme';
import { formatCurrency } from '../utils/format';
import { activeColor, activeLabel } from '../utils/status';

const initialForm = { name: '', description: '', price: '', categoryId: null };

export default function ProductScreen() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories]
  );

  const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const [categoryData, productData] = await Promise.all([
        categoryService.list(),
        productService.list()
      ]);
      setCategories(categoryData);
      setProducts(productData);
      setForm((current) =>
        current.categoryId || categoryData.length === 0
          ? current
          : { ...current, categoryId: categoryData[0].id }
      );
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

  const visibleProducts = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchCategory = !filterCategoryId || product.categoryId === filterCategoryId;
    return matchSearch && matchCategory;
  });

  function resetForm() {
    setEditingId(null);
    setForm({ ...initialForm, categoryId: activeCategories[0]?.id || null });
  }

  async function saveProduct() {
    if (!form.name.trim()) {
      setError('El nombre del producto es obligatorio');
      return;
    }
    if (!form.categoryId) {
      setError('Selecciona una categoria');
      return;
    }
    if (!Number(form.price) || Number(form.price) <= 0) {
      setError('El precio debe ser mayor a cero');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const payload = {
        ...form,
        price: Number(form.price),
        categoryId: Number(form.categoryId)
      };

      if (editingId) {
        await productService.update(editingId, payload);
      } else {
        await productService.create(payload);
      }

      resetForm();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(Number(product.price)),
      categoryId: product.categoryId
    });
  }

  function confirmDelete(product) {
    Alert.alert(
      'Eliminar producto',
      `Deseas eliminar o desactivar "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.remove(product.id);
              await load();
            } catch (err) {
              setError(getErrorMessage(err));
            }
          }
        }
      ]
    );
  }

  async function toggleStatus(product) {
    try {
      await productService.setStatus(product.id, !product.isActive);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.title}>{editingId ? 'Editar producto' : 'Nuevo producto'}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <InputField
            label="Nombre"
            placeholder="Ej. Cafe"
            value={form.name}
            onChangeText={(name) => setForm((current) => ({ ...current, name }))}
          />
          <InputField
            label="Precio"
            placeholder="Ej. 5000"
            keyboardType="numeric"
            value={form.price}
            onChangeText={(price) => setForm((current) => ({ ...current, price }))}
          />
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.chips}>
            {activeCategories.map((category) => (
              <FilterChip
                key={category.id}
                label={category.name}
                selected={form.categoryId === category.id}
                onPress={() => setForm((current) => ({ ...current, categoryId: category.id }))}
              />
            ))}
          </View>
          <InputField
            label="Descripcion"
            placeholder="Detalle visible en el menu"
            value={form.description}
            onChangeText={(description) => setForm((current) => ({ ...current, description }))}
            multiline
          />
          <AppButton
            title={editingId ? 'Guardar cambios' : 'Crear producto'}
            icon={editingId ? 'save-outline' : 'add-outline'}
            onPress={saveProduct}
            loading={saving}
          />
          {editingId ? (
            <AppButton title="Cancelar edicion" icon="close-outline" variant="ghost" onPress={resetForm} />
          ) : null}
        </Card>

        <Card>
          <InputField
            label="Buscar"
            placeholder="Nombre del producto"
            value={search}
            onChangeText={setSearch}
          />
          <Text style={styles.label}>Filtrar por categoria</Text>
          <View style={styles.chips}>
            <FilterChip label="Todas" selected={!filterCategoryId} onPress={() => setFilterCategoryId(null)} />
            {categories.map((category) => (
              <FilterChip
                key={category.id}
                label={category.name}
                selected={filterCategoryId === category.id}
                onPress={() => setFilterCategoryId(category.id)}
              />
            ))}
          </View>
        </Card>

        {loading ? <LoadingState /> : null}

        {!loading && visibleProducts.length === 0 ? (
          <EmptyState title="No hay productos" subtitle="Crea productos o ajusta los filtros." icon="fast-food-outline" />
        ) : null}

        {visibleProducts.map((product) => (
          <Card key={product.id}>
            <View style={styles.rowBetween}>
              <View style={styles.nameBox}>
                <Text style={styles.itemTitle}>{product.name}</Text>
                <Text style={styles.price}>{formatCurrency(product.price)}</Text>
              </View>
              <StatusBadge label={activeLabel(product.isActive)} color={activeColor(product.isActive)} />
            </View>
            <Text style={styles.description}>{product.description || 'Sin descripcion'}</Text>
            <Row label="Categoria" value={product.category?.name || 'Sin categoria'} />
            <View style={styles.actions}>
              <AppButton title="Editar" icon="create-outline" variant="outline" compact onPress={() => editProduct(product)} />
              <AppButton
                title={product.isActive ? 'Desactivar' : 'Activar'}
                icon={product.isActive ? 'pause-outline' : 'play-outline'}
                variant="ghost"
                compact
                onPress={() => toggleStatus(product)}
              />
              <AppButton title="Eliminar" icon="trash-outline" variant="danger" compact onPress={() => confirmDelete(product)} />
            </View>
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
  label: {
    color: colors.text,
    fontWeight: '800',
    marginBottom: spacing.sm
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    alignItems: 'flex-start',
    marginBottom: spacing.sm
  },
  nameBox: {
    flex: 1,
    paddingRight: spacing.sm
  },
  itemTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900'
  },
  price: {
    color: colors.teal,
    fontWeight: '900',
    fontSize: 16,
    marginTop: spacing.xs
  },
  description: {
    color: colors.muted,
    marginBottom: spacing.sm
  },
  actions: {
    marginTop: spacing.md
  }
});
