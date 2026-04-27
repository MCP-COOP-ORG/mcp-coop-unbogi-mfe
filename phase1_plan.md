# Phase 1 — Foundation (детальный план)

## Цель

К концу Phase 1 у нас есть работающий Expo проект в `packages/mobile`, который:
- Линкуется с `@unbogi/contracts` и `@unbogi/shared` через pnpm workspace
- Успешно резолвит Firebase через platform adapter (web vs native)
- Рендерит пустой экран с загруженными theme tokens
- Zustand stores из `shared` работают в RN

---

## Step 1 — Инициализация Expo проекта

**Что:** Создать `packages/mobile` с Expo SDK 55.

```bash
cd packages
npx create-expo-app mobile --template blank-typescript
```

**Потом:** Установить core зависимости:
```bash
cd mobile
npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler @shopify/react-native-skia expo-haptics lucide-react-native
npx expo install expo-router expo-linking expo-constants
```

**package.json** — добавить workspace deps:
```json
{
  "name": "@unbogi/mobile",
  "dependencies": {
    "@unbogi/contracts": "workspace:*",
    "@unbogi/shared": "workspace:*",
    "zustand": "^5.0.12"
  }
}
```

**Результат:** `packages/mobile` существует, `pnpm install` проходит без ошибок.

---

## Step 2 — Конфигурация Metro + pnpm workspace

**Проблема:** Metro bundler (Expo) по умолчанию не понимает pnpm symlinks и не видит файлы за пределами `packages/mobile`.

**Решение:** `metro.config.js` с настройкой `watchFolders` и `nodeModulesPaths`:

```js
// packages/mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch monorepo packages
config.watchFolders = [monorepoRoot];

// Resolve modules from both project and monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Ensure only one copy of React
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
```

**Проверка:** `npx expo start` запускается без ошибок резолва модулей.

---

## Step 3 — Platform adapter для `@unbogi/shared` Firebase

**Текущая проблема (3 блокера):**

1. `shared/src/firebase/index.ts` импортирует `firebase/app` (web SDK) — в RN нужен `@react-native-firebase/app`
2. Использует `import.meta.env` — это Vite-only API, Metro его не понимает
3. `authApi` и stores импортируют `signInWithCustomToken` из `firebase/auth` (web)

**Стратегия:** Разделить Firebase init на два файла через platform extension:

```
shared/src/firebase/
├── index.ts          → barrel (реэкспорт из init)
├── init.ts           → текущий код (для web/Vite)  
├── init.native.ts    → НОВЫЙ (для RN/Metro)
└── types.ts          → НОВЫЙ (общий интерфейс)
```

> [!IMPORTANT]
> Metro резолвит `.native.ts` автоматически перед `.ts`. Vite этого НЕ делает — поэтому мы оставляем `init.ts` как есть для web, и добавляем `init.native.ts` для RN. Barrel `index.ts` просто реэкспортирует `./init`.

**Файл `shared/src/firebase/types.ts`** (новый):
```ts
import type { Auth } from 'firebase/auth';
import type { Functions } from 'firebase/functions';
import type { FirebaseApp } from 'firebase/app';

export interface FirebaseExports {
  app: FirebaseApp;
  auth: Auth;
  functions: Functions;
}
```

**Файл `shared/src/firebase/init.native.ts`** (новый):
```ts
// RN Firebase — нативные SDK
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';

// Native SDK читает конфиг из google-services.json / GoogleService-Info.plist
// Инициализация не нужна — нативные SDK делают это автоматически

export const app = firebase.app();
export const authInstance = auth();
export const functionsInstance = functions();
functionsInstance.useEmulator('localhost', 5001); // DEV only, убрать в проде
```

> [!WARNING]
> **Блокер:** `authApi` и `store.ts` в shared импортируют `signInWithCustomToken` и `httpsCallable` напрямую из `firebase/auth` и `firebase/functions` (web SDK). Для RN нужны импорты из `@react-native-firebase/*`. Это значит что `authApi` и `auth store` тоже нуждаются в platform adapter'ах, либо нужна абстракция через общий интерфейс. Это главная работа этого шага.

**Подход:** Создать thin adapter-функции в `shared/src/firebase/`:
```ts
// shared/src/firebase/callable.ts — web
export { httpsCallable } from 'firebase/functions';
export { signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

// shared/src/firebase/callable.native.ts — RN  
// Реэкспорт совместимых API из @react-native-firebase
```

Stores и API тогда импортируют из `../../firebase/callable` вместо напрямую из `firebase/*`.

---

## Step 4 — Конфигурация переменных окружения

**Проблема:** `shared` использует `import.meta.env.UNBOGI_*` — это Vite-only.

В RN (`init.native.ts`) это не нужно — нативные Firebase SDK читают конфиг из:
- **Android:** `android/app/google-services.json`
- **iOS:** `ios/GoogleService-Info.plist`

Но для `DEV` флага (emulator toggle) нужна альтернатива.

**Решение для mobile:** `expo-constants` + `app.json` extra:
```json
// packages/mobile/app.json
{
  "expo": {
    "extra": {
      "useFirebaseEmulator": false
    }
  }
}
```

Это нативная конфигурация — `init.native.ts` читает через `Constants.expoConfig.extra`.

---

## Step 5 — Theme tokens

**Что:** Перенести дизайн-токены из TMA в platform-agnostic TS-объект.

**Источники:**
- `tma/src/styles/theme.css` — CSS custom properties (цвета, радиусы)
- `tma/src/styles/style-constants.ts` — тени, размеры, цвета (частично через CSS vars)

**Новый файл `mobile/src/theme/tokens.ts`:**
```ts
export const colors = {
  ink: '#1A1A1A',
  cream: '#FFF5E1',
  warmBg: '#FAF6EE',
  errorRed: '#EB2D2D',
  successGreen: '#7AB648',
  muted: '#A1A1AA',
  text: '#2B2A2C',
  // Button variants
  orange: '#F5A623',
  red: '#E05252',
  cyan: '#5AABDE',
  lime: '#7AB648',
} as const;

export const radii = {
  sm: 12,
  md: 20,
  lg: 26,
  full: 9999,
  field: 14,
  button: 28,
} as const;

export const sizing = {
  buttonHeight: 42,
  fieldHeight: 42,
} as const;

export const typography = {
  // Будет определено после подключения шрифтов
} as const;
```

---

## Step 6 — Root Layout

**Что:** Минимальный `app/_layout.tsx` с провайдерами.

```tsx
// packages/mobile/app/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
```

**Плюс:** Простой `app/index.tsx` для smoke test:
```tsx
import { View, Text } from 'react-native';
import { colors } from '../src/theme/tokens';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.warmBg, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.ink, fontSize: 24, fontWeight: 'bold' }}>
        UnBoGi Mobile 🎁
      </Text>
    </View>
  );
}
```

---

## Step 7 — Smoke test: Zustand stores из shared

**Что:** Проверить что stores из `@unbogi/shared` инициализируются в RN без ошибок.

**Тест-сценарий в `app/index.tsx`:**
```tsx
import { useAuthStore } from '@unbogi/shared';

export default function HomeScreen() {
  const status = useAuthStore((s) => s.status);
  return (
    <View>
      <Text>Auth status: {status}</Text>
    </View>
  );
}
```

**Успех:** Экран показывает `Auth status: idle` — значит Zustand store из shared резолвится и работает через pnpm workspace + Metro.

---

## Чеклист готовности Phase 1

- [ ] `packages/mobile` существует, `pnpm install` ✅
- [ ] `npx expo start` запускается без ошибок ✅
- [ ] Metro резолвит `@unbogi/contracts` и `@unbogi/shared` ✅
- [ ] `shared/firebase` имеет platform adapter (`.native.ts`) ✅
- [ ] Zustand stores инициализируются в RN ✅
- [ ] Theme tokens экспортированы в `mobile/src/theme/tokens.ts` ✅
- [ ] Root layout с `GestureHandlerRootView` рендерит экран ✅

---

## Риски и зависимости

| Риск | Вероятность | Митигация |
|:---|:---:|:---|
| Metro не резолвит workspace symlinks | Средняя | `watchFolders` + `nodeModulesPaths` в metro.config.js |
| `firebase` web SDK импортируется в RN через shared | Высокая | Platform adapter (`.native.ts`) + абстракция callable |
| `import.meta.env` крашит Metro | 100% | Native SDK не использует env vars — конфиг из plist/json |
| Дублирование React (workspace vs mobile) | Средняя | `disableHierarchicalLookup` + корректные peerDependencies |
| `@react-native-firebase` конфликтует с Expo managed | Низкая | Expo SDK 55 поддерживает config plugins для RN Firebase |
