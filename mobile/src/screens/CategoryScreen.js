import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import InputField from '../components/InputField';
import LoadingState from '../components/LoadingState';
import Row from '../components/Row';
import Screen from '../components/Screen';
import StatusBadge from '../components/StatusBadge';
import { getErrorMessage } from '../services/api';
import { categoryService } from '../services/categoryService';
import { colors, spacing } from '../styles/theme';
import { formatDate } from '../utils/format';
import { activeColor, activeLabel } from '../utils/status';

const initialForm = { name: '', description: '' };

export default function CategoryScreen() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      setCategories(await categoryService.list());
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

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function saveCategory() {
    if (!form.name.trim()) {
      setError('El nombre de la categoria es obligatorio');
      return;
    }

    try {
      setSaving(true);
      setError('');
      if (editingId) {
        await categoryService.update(editingId, form);
      } else {
        await categoryService.create(form);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function editCategory(category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description || ''
    });
  }

  function confirmDelete(category) {
    Alert.alert(
      'Eliminar categoria',
      `Deseas eliminar o desactivar "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryService.remove(category.id);
              await load();
            } catch (err) {
              setError(getErrorMessage(err));
            }
          }
        }
      ]
    );
  }

  async function toggleStatus(category) {
    try {
      await categoryService.setStatus(category.id, !category.isActive);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.title}>{editingId ? 'Editar categoria' : 'Nueva categoria'}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <InputField
            label="Nombre"
            placeholder="Ej. Bebidas"
            value={form.name}
            onChangeText={(name) => setForm((current) => ({ ...current, name }))}
          />
          <InputField
            label="Descripcion"
            placeholder="Detalles de la categoria"
            value={form.description}
            onChangeText={(description) => setForm((current) => ({ ...current, description }))}
            multiline
          />
          <AppButton
            title={editingId ? 'Guardar cambios' : 'Crear categoria'}
            icon={editingId ? 'save-outline' : 'add-outline'}
            onPress={saveCategory}
            loading={saving}
          />
          {editingId ? (
            <AppButton title="Cancelar edicion" icon="close-outline" variant="ghost" onPress={resetForm} />
          ) : null}
        </Card>

        {loading ? <LoadingState /> : null}

        {!loading && categories.length === 0 ? (
          <EmptyState title="No hay categorias" subtitle="Crea la primera categoria del menu." />
        ) : null}

        {categories.map((category) => (
          <Card key={category.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{category.name}</Text>
              <StatusBadge label={activeLabel(category.isActive)} color={activeColor(category.isActive)} />
            </View>
            <Text style={styles.description}>{category.description || 'Sin descripcion'}</Text>
            <Row label="Productos asociados" value={category._count?.products || 0} />
            <Row label="Creada" value={formatDate(category.createdAt)} />
            <View style={styles.actions}>
              <AppButton title="Editar" icon="create-outline" variant="outline" compact onPress={() => editCategory(category)} />
              <AppButton
                title={category.isActive ? 'Desactivar' : 'Activar'}
                icon={category.isActive ? 'pause-outline' : 'play-outline'}
                variant="ghost"
                compact
                onPress={() => toggleStatus(category)}
              />
              <AppButton title="Eliminar" icon="trash-outline" variant="danger" compact onPress={() => confirmDelete(category)} />
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
  error: {
    color: colors.danger,
    fontWeight: '700',
    marginBottom: spacing.md
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  itemTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    flex: 1,
    paddingRight: spacing.sm
  },
  description: {
    color: colors.muted,
    marginBottom: spacing.sm
  },
  actions: {
    marginTop: spacing.md
  }
});
