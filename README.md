# 📱 Bite&Go Mobile — App Cliente

App móvil para clientes de la plataforma Bite&Go. Explorar restaurantes, hacer pedidos, reservar mesas, gestionar perfil y más. Disponible para Android e iOS.

![React Native](https://img.shields.io/badge/React_Native-0.85-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-56-000020?logo=expo)
![NativeWind](https://img.shields.io/badge/NativeWind-4-06B6D4?logo=tailwindcss)
![React Navigation](https://img.shields.io/badge/React_Nav-7-000000?logo=react)

---

## 📋 Descripción

Aplicación móvil para clientes de Bite&Go construida con React Native + Expo. Consume las mismas APIs que el frontend web: `auth-service` (.NET, puerto 3000) para autenticación y `user-service` (Node, puerto 3001) para restaurantes, pedidos, reservas y perfil.

---

## ⚙️ Stack

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| `react-native` | 0.85.3 | Framework mobile |
| `expo` | ~56.0.5 | Toolchain y build |
| `nativewind` | ^4.2.6 | Tailwind CSS para RN |
| `zustand` | ^5.0.14 | Estado global |
| `@react-navigation/native` | ^7.3.0 | Navegación |
| `@react-navigation/native-stack` | ^7.17.2 | Stack navigator |
| `@react-navigation/bottom-tabs` | ^7.18.0 | Bottom tabs |
| `react-hook-form` | ^7.78.0 | Formularios |
| `axios` | ^1.17.0 | HTTP client |
| `expo-secure-store` | ~56.0.0 | Almacenamiento seguro de tokens |
| `expo-image-picker` | ~56.0.0 | Selección de fotos |
| `expo-linear-gradient` | ~56.0.4 | Gradientes |
| `@gorhom/bottom-sheet` | ^5.2.14 | Bottom sheets |
| `lucide-react-native` | ^1.23.0 | Iconos |
| `react-native-reanimated` | 4.3.1 | Animaciones |
| `react-native-gesture-handler` | ~2.31.1 | Gestos |
| `react-native-safe-area-context` | ~5.7.0 | Safe area |
| `react-native-svg` | 15.15.4 | SVG |

---

## 🏗️ Estructura del Proyecto

```
client-user-mobile-bite-go/
├── App.js                          # Root: GestureHandler > SafeArea > BottomSheetModal > AlertProvider > AppNavigator
├── index.js                        # Entry point (registerRootComponent)
├── app.json                        # Expo config (name, slug, version, icons, plugins)
├── babel.config.js                 # Babel con nativewind/reanimated
├── metro.config.js                 # Metro bundler config
├── tailwind.config.js              # NativeWind config
├── global.css                      # Tailwind import
│
└── src/
    ├── navigation/                 # Navegación
    │   ├── AppNavigator.jsx        # Navegador raíz (decide AuthStack vs MainTabs)
    │   ├── AuthStack.jsx           # Stack: Login, Register, ForgotPassword, ResetPassword
    │   └── MainTabs.jsx            # Bottom tabs: Restaurantes, Pedidos, Reservas, Notificaciones, Perfil
    │
    ├── features/                   # Módulos funcionales
    │   ├── auth/                   # Autenticación
    │   │   ├── hooks/useAuth.js    # Handlers: login, register, forgot, reset, resend
    │   │   └── screens/
    │   │       ├── LoginScreen.jsx
    │   │       ├── RegisterScreen.jsx      # Con pantalla de verificación + cooldown 45s
    │   │       ├── ForgotPasswordScreen.jsx
    │   │       └── ResetPasswordScreen.jsx
    │   │
    │   ├── restaurants/            # Restaurantes
    │   │   ├── hooks/
    │   │   ├── components/
    │   │   └── screens/ (Lista, Detalle)
    │   │
    │   ├── orders/                 # Pedidos
    │   │   ├── hooks/
    │   │   └── screens/ (Historial, Detalle)
    │   │
    │   ├── reservations/           # Reservas
    │   │   ├── hooks/
    │   │   └── screens/ (Lista, Crear)
    │   │
    │   ├── profile/                # Perfil
    │   │   ├── hooks/
    │   │   └── screens/ (Datos, Favoritos, Direcciones)
    │   │
    │   ├── notifications/          # Notificaciones
    │   │   ├── hooks/
    │   │   └── screens/
    │   │
    │   └── reviews/                # Reseñas
    │       ├── hooks/
    │       └── screens/
    │
    └── shared/                     # Compartido
        ├── api/                    # Clientes Axios
        │   ├── authClient.js       # Auth-service (.NET) endpoints
        │   └── userClient.js       # User-service (Node) endpoints
        ├── store/
        │   └── authStore.js        # Zustand persistido
        ├── constants/              # Constantes de la app
        ├── hooks/                  # Hooks compartidos
        ├── providers/              # AlertProvider
        └── components/             # Componentes UI compartidos
```

---

## 🧭 Navegación

```
AppNavigator
├── [no autenticado] AuthStack
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   └── ResetPassword
│
└── [autenticado] MainTabs (bottom tabs)
    ├── 🏪 Restaurantes (stack)
    │   ├── Lista
    │   └── Detalle + Menú
    ├── 📦 Pedidos
    ├── 🪑 Reservas
    ├── 🔔 Notificaciones
    └── 👤 Perfil
```

---

## 🔐 Flujo de Autenticación

- **Login**: `LoginScreen` → `useAuth.handleLogin()` → `POST /api/v1/Auth/login` → JWT → `syncUser()` → navega a MainTabs
- **Register**: `RegisterScreen` → `POST /api/v1/Auth/register` (multipart) → pantalla de verificación con cooldown 45s para reenviar
- **ForgotPassword**: `handleForgotPassword(email)` → `POST /api/v1/Auth/forgot-password`
- **ResetPassword**: `handleResetPassword(token, password)` → `POST /api/v1/Auth/reset-password`
- **Session**: Almacenada en `authStore` (Zustand) usando `expo-secure-store` para el token

---

## 📡 API

| Cliente | Base URL | Servicio |
|---------|----------|----------|
| `authClient.js` | `http://localhost:3000/api/v1/Auth` | Auth-service .NET |
| `userClient.js` | `http://localhost:3001/bite-and-go/v1` | User-service Node |

**Funciones principales:**

| Archivo | Funciones |
|---------|-----------|
| `authClient.js` | login, register, verifyEmail, resendVerification, forgotPassword, resetPassword |
| `userClient.js` | getRestaurants, getProducts, getMyOrders, createOrder, getMyReservations, createReservation, getFavorites, toggleFavorite, getAddresses, addAddress, getNotifications, createReview... |

---

## 🚀 Inicio Rápido

### Requisitos

- Node.js 18+
- Expo Go app ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- Opcional: Android Studio / Xcode para emuladores
- Backends: auth-service (3000) + user-service (3001) corriendo

### Instalación

```bash
# 1. Clonar e instalar
cd client-user-mobile-bite-go
npm install

# 2. Iniciar Expo
npx expo start
```

### Conexión

| Dispositivo | Acción |
|-------------|--------|
| **Físico** | Escanea el QR con Expo Go |
| **Android** | Presiona `a` (requiere ADB) |
| **iOS** | Presiona `i` (requiere Xcode) |
| **Web** | Presiona `w` (versión limitada) |

> **Importante:** La app necesita los backends corriendo. Usa `docker compose up` desde la raíz del monorepo.

---

## 🚢 Despliegue (Expo / EAS)

```bash
# 1. Build
eas build --platform all --profile production

# 2. Submit a stores
eas submit --platform android
eas submit --platform ios
```

**Variables de entorno en EAS (se crean con `eas env:create`):**
```
EXPO_PUBLIC_AUTH_URL=https://auth-service.onrender.com/api/v1/auth
EXPO_PUBLIC_USER_URL=https://user-service.onrender.com/bite-and-go/v1
```

---

## 🎨 Paleta de Colores

| Uso | Color |
|-----|-------|
| Primary | `#E67E22` |
| Dark primary | `#D35400` |
| Brown | `#3A2E2A` |
| Creams | `#F5EFE6`, `#E8D8C3` |
| Grays | `#2B2B2B`, `#6B6B6B` |
| Rojo | `#C0392B` |
| Verde | `#A8D5BA` |
| Azul | `#A9C7E8` |
