import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import CategoryScreen from '../screens/CategoryScreen';
import ProductScreen from '../screens/ProductScreen';
import CashRegisterScreen from '../screens/CashRegisterScreen';
import CreateOrderScreen from '../screens/CreateOrderScreen';
import OpenOrdersScreen from '../screens/OpenOrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import AddOrderItemScreen from '../screens/AddOrderItemScreen';
import PaidOrdersScreen from '../screens/PaidOrdersScreen';
import DeletedOrdersScreen from '../screens/DeletedOrdersScreen';
import { colors } from '../styles/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerTintColor: colors.primary
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Comandas' }} />
      <Stack.Screen name="Categories" component={CategoryScreen} options={{ title: 'Categorias' }} />
      <Stack.Screen name="Products" component={ProductScreen} options={{ title: 'Productos' }} />
      <Stack.Screen name="CashRegister" component={CashRegisterScreen} options={{ title: 'Caja registradora' }} />
      <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: 'Crear comanda' }} />
      <Stack.Screen name="OpenOrders" component={OpenOrdersScreen} options={{ title: 'Comandas abiertas' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Detalle de comanda' }} />
      <Stack.Screen name="AddOrderItem" component={AddOrderItemScreen} options={{ title: 'Agregar producto' }} />
      <Stack.Screen name="PaidOrders" component={PaidOrdersScreen} options={{ title: 'Comandas pagadas' }} />
      <Stack.Screen name="DeletedOrders" component={DeletedOrdersScreen} options={{ title: 'Comandas eliminadas' }} />
    </Stack.Navigator>
  );
}
