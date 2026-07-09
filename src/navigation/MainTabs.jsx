import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BRAND } from "../shared/constants/tokens";
import { COLORS } from "../shared/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

import RestaurantsScreen from "../features/restaurants/screens/RestaurantsScreen";
import RestaurantDetailScreen from "../features/restaurants/screens/RestaurantDetailScreen";
import CreateOrderScreen from "../features/orders/screens/CreateOrderScreen";
import OrderDetailScreen from "../features/orders/screens/OrderDetailScreen";
import OrdersScreen from "../features/orders/screens/OrdersScreen";
import CreateReservationScreen from "../features/reservations/screens/CreateReservationScreen";
import ReservationsScreen from "../features/reservations/screens/ReservationsScreen";
import CreateReviewScreen from "../features/reviews/screens/CreateReviewScreen";
import ReviewsScreen from "../features/reviews/screens/ReviewsScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import AddressesScreen from "../features/profile/screens/AddressesScreen";
import NotificationsScreen from "../features/notifications/screens/NotificationsScreen";
import FavoritesScreen from "../features/restaurants/screens/FavoritesScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const orangeHeader = {
    headerStyle: { backgroundColor: COLORS.primary },
    headerTintColor: "#fff",
    headerTitleStyle: { fontWeight: "700", fontSize: 16 },
    headerShadowVisible: false,
};

const RestaurantsStack = () => (
    <Stack.Navigator screenOptions={orangeHeader}>
        <Stack.Screen name="RestaurantsList" component={RestaurantsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: "Nuevo Pedido" }} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: "Mis Favoritos" }} />
        <Stack.Screen name="CreateReview" component={CreateReviewScreen} options={{ title: "Escribir Resena" }} />
    </Stack.Navigator>
);

const OrdersStack = () => (
    <Stack.Navigator screenOptions={orangeHeader}>
        <Stack.Screen name="OrdersList" component={OrdersScreen} options={{ title: "Mis Pedidos" }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Detalle del Pedido" }} />
        <Stack.Screen name="CreateReview" component={CreateReviewScreen} options={{ title: "Calificar Pedido" }} />
    </Stack.Navigator>
);

const ReservationsStack = () => (
    <Stack.Navigator screenOptions={orangeHeader}>
        <Stack.Screen name="ReservationsList" component={ReservationsScreen} options={{ title: "Reservaciones" }} />
        <Stack.Screen name="CreateReservation" component={CreateReservationScreen} options={{ title: "Nueva Reservacion" }} />
        <Stack.Screen name="CreateReview" component={CreateReviewScreen} options={{ title: "Escribir Resena" }} />
    </Stack.Navigator>
);

const ProfileStack = () => (
    <Stack.Navigator screenOptions={orangeHeader}>
        <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: "Mis Direcciones" }} />
        <Stack.Screen name="MyReviews" component={ReviewsScreen} options={{ title: "Mis Resenas" }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notificaciones" }} />
    </Stack.Navigator>
);

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: BRAND.primary,
                tabBarInactiveTintColor: BRAND.muted,
                tabBarStyle: {
                    backgroundColor: "#FFFFFF",
                    borderTopWidth: 0,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
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
            <Tab.Screen name="Orders" component={OrdersStack} options={{ title: "Pedidos" }} />
            <Tab.Screen name="Reservations" component={ReservationsStack} options={{ title: "Reservaciones" }} />
            <Tab.Screen name="Profile" component={ProfileStack} options={{ title: "Perfil" }} />
        </Tab.Navigator>
    );
};

export default MainTabs;
