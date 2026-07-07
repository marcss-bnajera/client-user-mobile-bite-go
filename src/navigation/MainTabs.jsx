import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { COLORS } from "../shared/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

import RestaurantsScreen from "../features/restaurants/screens/RestaurantsScreen";
import RestaurantDetailScreen from "../features/restaurants/screens/RestaurantDetailScreen";
import CreateOrderScreen from "../features/orders/screens/CreateOrderScreen";
import OrdersScreen from "../features/orders/screens/OrdersScreen";
import CreateReservationScreen from "../features/reservations/screens/CreateReservationScreen";
import ReservationsScreen from "../features/reservations/screens/ReservationsScreen";
import CreateReviewScreen from "../features/reviews/screens/CreateReviewScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const RestaurantsStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="RestaurantsList" component={RestaurantsScreen} options={{ title: "Restaurantes" }} />
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{ title: "Detalle" }} />
        <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: "Nuevo Pedido" }} />
    </Stack.Navigator>
);

const OrdersStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="OrdersList" component={OrdersScreen} options={{ title: "Mis Pedidos" }} />
        <Stack.Screen name="CreateReview" component={CreateReviewScreen} options={{ title: "Calificar Pedido" }} />
    </Stack.Navigator>
);

const ReservationsStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="ReservationsList" component={ReservationsScreen} options={{ title: "Reservaciones" }} />
        <Stack.Screen name="CreateReservation" component={CreateReservationScreen} options={{ title: "Nueva Reservación" }} />
    </Stack.Navigator>
);

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.secondary,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 4,
                },
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === "Restaurants") iconName = "restaurant";
                    else if (route.name === "Orders") iconName = "shopping-bag";
                    else if (route.name === "Reservations") iconName = "event";
                    else if (route.name === "Profile") iconName = "person";
                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Restaurants" component={RestaurantsStack} options={{ title: "Restaurantes" }} />
            <Tab.Screen name="Orders" component={OrdersStack} options={{ title: "Mis Pedidos" }} />
            <Tab.Screen name="Reservations" component={ReservationsStack} options={{ title: "Reservaciones" }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil", headerShown: true }} />
        </Tab.Navigator>
    );
};

export default MainTabs;
