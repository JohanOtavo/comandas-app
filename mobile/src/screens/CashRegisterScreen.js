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
import { cashRegisterService } from '../services/cashRegisterService';
import { colors, spacing } from '../styles/theme';
import { formatCurrency, formatDate } from '../utils/format';
import { cashStatusLabel } from '../utils/status';

export default function CashRegisterScreen() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [initialAmount, setInitialAmount] = useState('');
  const [openingNote, setOpeningNote] = useState('');
  const [closingNote, setClosingNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const [currentCash, historyData] = await Promise.all([
        cashRegisterService.current(),
        cashRegisterService.history()
      ]);
      setCurrent(currentCash);
      setHistory(historyData);
      if (currentCash) {
        setOpeningNote(currentCash.openingNote || '');
      }
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

  async function openCashRegister() {
    if (Number(initialAmount) < 0 || initialAmount === '') {
      setError('El monto inicial debe ser mayor o igual a cero');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await cashRegisterService.open({
        initialAmount: Number(initialAmount),
        openingNote
      });
      setInitialAmount('');
      setOpeningNote('');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveNotes() {
    if (!current) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      await cashRegisterService.update(current.id, { openingNote, closingNote });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function confirmClose(requireFourDays = false) {
    Alert.alert(
      'Cerrar caja',
      requireFourDays
        ? 'La caja solo se cerrara si ya cumple 4 dias abierta.'
        : 'Al cerrar la caja se calculara el total esperado y no podra recibir mas pagos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar caja',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              setError('');
              await cashRegisterService.close({ closingNote, requireFourDays });
              setClosingNote('');
              setSelected(null);
              await load();
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

  async function showDetail(cashRegister) {
    try {
      setError('');
      setSelected(await cashRegisterService.detail(cashRegister.id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? <LoadingState /> : null}

        <Card>
          <Text style={styles.title}>{current ? 'Caja abierta' : 'Abrir caja'}</Text>
          {current ? (
            <>
              <StatusBadge label="Abierta" color={colors.success} />
              <Row label="Monto inicial" value={formatCurrency(current.initialAmount)} />
              <Row label="Total vendido" value={formatCurrency(current.totalSales)} strong />
              <Row label="Total esperado" value={formatCurrency(current.expectedAmount)} />
              <Row label="Fecha apertura" value={formatDate(current.openedAt)} />
              <InputField
                label="Observacion de apertura"
                value={openingNote}
                onChangeText={setOpeningNote}
                placeholder="Nota de apertura"
                multiline
              />
              <InputField
                label="Observacion de cierre"
                value={closingNote}
                onChangeText={setClosingNote}
                placeholder="Nota al cerrar caja"
                multiline
              />
              <AppButton title="Guardar observaciones" icon="save-outline" variant="outline" onPress={saveNotes} loading={saving} />
              <AppButton title="Cerrar caja" icon="lock-closed-outline" variant="danger" onPress={() => confirmClose(false)} loading={saving} />
              <AppButton title="Cerrar si cumplio 4 dias" icon="time-outline" variant="warning" onPress={() => confirmClose(true)} loading={saving} />
            </>
          ) : (
            <>
              <InputField
                label="Monto inicial"
                value={initialAmount}
                onChangeText={setInitialAmount}
                keyboardType="numeric"
                placeholder="Ej. 100000"
              />
              <InputField
                label="Observacion"
                value={openingNote}
                onChangeText={setOpeningNote}
                placeholder="Nota opcional"
                multiline
              />
              <AppButton title="Abrir caja" icon="lock-open-outline" variant="success" onPress={openCashRegister} loading={saving} />
            </>
          )}
        </Card>

        {selected ? (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.title}>Detalle caja #{selected.id}</Text>
              <StatusBadge
                label={cashStatusLabel(selected.status)}
                color={selected.status === 'OPEN' ? colors.success : colors.muted}
              />
            </View>
            <Row label="Monto inicial" value={formatCurrency(selected.initialAmount)} />
            <Row label="Total vendido" value={formatCurrency(selected.totalSales)} strong />
            <Row label="Total esperado" value={formatCurrency(selected.expectedAmount)} />
            <Row label="Apertura" value={formatDate(selected.openedAt)} />
            <Row label="Cierre" value={formatDate(selected.closedAt)} />
            <Text style={styles.sectionTitle}>Comandas pagadas en esta caja</Text>
            {selected.orders?.length ? (
              selected.orders.map((order) => (
                <View key={order.id} style={styles.orderLine}>
                  <Text style={styles.orderName}>{order.name}</Text>
                  <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.muted}>No hay comandas pagadas asociadas.</Text>
            )}
          </Card>
        ) : null}

        <Text style={styles.listTitle}>Historial</Text>
        {!loading && history.length === 0 ? (
          <EmptyState title="No hay cajas registradas" icon="cash-outline" />
        ) : null}
        {history.map((cashRegister) => (
          <Card key={cashRegister.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>Caja #{cashRegister.id}</Text>
              <StatusBadge
                label={cashStatusLabel(cashRegister.status)}
                color={cashRegister.status === 'OPEN' ? colors.success : colors.muted}
              />
            </View>
            <Row label="Total vendido" value={formatCurrency(cashRegister.totalSales)} strong />
            <Row label="Apertura" value={formatDate(cashRegister.openedAt)} />
            <Row label="Cierre" value={formatDate(cashRegister.closedAt)} />
            <AppButton title="Ver detalle" icon="eye-outline" variant="outline" compact onPress={() => showDetail(cashRegister)} />
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
    fontWeight: '900',
    fontSize: 18,
    marginBottom: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '900',
    marginTop: spacing.lg,
    marginBottom: spacing.sm
  },
  itemTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  error: {
    color: colors.danger,
    fontWeight: '700',
    marginBottom: spacing.md
  },
  muted: {
    color: colors.muted
  },
  orderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm
  },
  orderName: {
    color: colors.text,
    fontWeight: '700'
  },
  orderTotal: {
    color: colors.success,
    fontWeight: '900'
  }
});
