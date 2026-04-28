# 📱 `@unbogi/mobile` — План

## Тех стек (актуальные версии — April 2026)

| Слой | Технология | Версия | Зачем |
|:---|:---|:---:|:---|
| **Runtime** | Expo SDK 55 (managed) | `55.0.x` | React Native 0.83, React 19.2, New Architecture |
| **Navigation** | `expo-router` | `55.0.x` | File-based routing, native tabs, deep links |
| **Анимации** | `react-native-reanimated` | `4.3.0` | UI-thread 60fps, New Architecture (Fabric) |
| **Worklets** | `react-native-worklets` | `0.8.1` | Обязательный peer dep для Reanimated 4 |
| **Жесты** | `react-native-gesture-handler` | `2.31.0` | Нативная обработка жестов |
| **Canvas (scratch)** | `@shopify/react-native-skia` | `2.6.2` | GPU Skia рендер, замена HTML Canvas |
| **Firebase** | `@react-native-firebase/*` | `24.0.0` | Нативные SDK (Auth, Functions, Firestore, Messaging) |
| **Auth iOS** | `expo-apple-authentication` | `55.0.x` | Apple Sign-In |
| **Auth Android** | `@react-native-google-signin/google-signin` | `16.1.2` | Google Sign-In |
| **Push** | `@react-native-firebase/messaging` | `24.0.0` | FCM (Android) / APNs (iOS) |
| **Контакты** | `expo-contacts` | `55.0.x` | Нативный пикер для инвайтов |
| **Haptics** | `expo-haptics` | `55.0.x` | Taptic Engine / Vibration |
| **Камера** | `expo-camera` | `55.0.x` | QR scanner |
| **Иконки** | `lucide-react-native` | `1.11.0` | Те же иконки что в TMA |
| **Линтинг** | Biome (уже в монорепе) | — | Единый стиль |
| **Тесты** | Jest + React Native Testing Library | — | Компонентные тесты |

> [!NOTE]
> Expo SDK 55 включает **New Architecture** (Fabric) по умолчанию. Reanimated 4.x требует New Architecture — всё совместимо. Expo-пакеты (`expo-*`) версионируются по SDK — устанавливаются через `npx expo install` автоматически.

---

## Архитектура в монорепе

```
packages/
├── contracts/         ← БЕЗ ИЗМЕНЕНИЙ (Zod, типы, константы)
├── firebase/          ← БЕЗ ИЗМЕНЕНИЙ (Cloud Functions)
├── shared/            ← МИНИМАЛЬНЫЕ ИЗМЕНЕНИЯ (adapter pattern для Firebase init)
│   ├── src/
│   │   ├── firebase/
│   │   │   ├── init.ts          → init.web.ts  (переименовать)
│   │   │   └── init.native.ts   → НОВЫЙ (RN Firebase init)
│   │   ├── stores/              ← без изменений, Zustand работает в RN
│   │   └── api/                 ← без изменений, httpsCallable через adapter
├── tma/               ← БЕЗ ИЗМЕНЕНИЙ
└── mobile/            ← НОВЫЙ ПАКЕТ
    ├── app/                     ← expo-router screens (file-based)
    │   ├── _layout.tsx          ← Root layout (providers, fonts, theme)
    │   ├── login.tsx
    │   └── (main)/
    │       ├── _layout.tsx      ← Tab layout
    │       ├── surprises.tsx
    │       └── collection.tsx
    ├── src/
    │   ├── ui/                  ← Neo-Brutalism RN компоненты
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── form-field.tsx
    │   │   ├── postcard.tsx
    │   │   ├── scratch-canvas.tsx  ← Skia
    │   │   ├── flip-flap.tsx      ← Reanimated 3D
    │   │   ├── slider.tsx         ← FlatList-based
    │   │   └── bottom-nav.tsx
    │   ├── theme/               ← Design tokens (из style-constants.ts)
    │   │   └── tokens.ts
    │   ├── lib/
    │   │   ├── auth.ts          ← Apple/Google Sign-In + email sync
    │   │   ├── contacts.ts      ← expo-contacts wrapper
    │   │   ├── notifications.ts ← FCM registration + handlers
    │   │   └── haptics.ts       ← expo-haptics wrapper
    │   └── hooks/
    │       └── use-scratch-gesture.ts  ← Skia + gesture-handler версия
    ├── app.json
    ├── package.json
    └── tsconfig.json
```

---

## Что переиспользуется, что переписывается

| Что | Статус | Детали |
|:---|:---:|:---|
| `@unbogi/contracts` (Zod, типы) | ✅ As-is | `workspace:*` dependency |
| `@unbogi/shared` stores (auth, gifts, contacts, holidays, invites) | ✅ As-is | Zustand работает в RN идентично |
| `@unbogi/shared` API clients | ✅ As-is | После adapter'а Firebase init |
| `@unbogi/shared` Firebase init | 🔧 Adapter | `.web.ts` / `.native.ts` — platform resolution |
| UI компоненты (17 шт) | 🆕 С нуля | Новые RN-компоненты, тот же визуал |
| Scratch gesture hook | 🆕 С нуля | `react-native-gesture-handler` + Skia |
| Auth flow | 🆕 С нуля | Apple/Google Sign-In вместо Telegram HMAC |
| Invite flow | 🆕 Переделка | Контакты вместо email |
| Push notifications | 🆕 С нуля | FCM, нет аналога в TMA |
| Design tokens | 🔧 Экспорт | `style-constants.ts` → `theme/tokens.ts` |

---

## Адаптация `@unbogi/shared`

Главное изменение — **platform-aware Firebase init**. React Native резолвит файлы по расширению:

```
init.ts        → текущий web-код (переименовать в init.web.ts)
init.native.ts → новый, @react-native-firebase/app init
```

Metro bundler (Expo) автоматически выберет `.native.ts` для мобильного билда, а Vite (TMA) продолжит использовать `.web.ts`. **Stores и API clients не меняются вообще.**

---

## Auth: синхронизация по email

```
Mobile login flow:
1. Apple Sign-In (iOS) / Google Sign-In (Android)
   → получаем Firebase Auth credential → signInWithCredential()
   → Firebase Auth создаёт/находит пользователя
   → email = уникальный ключ синхронизации

2. Backend (Cloud Function):
   → проверяет email в Firestore users collection
   → если пользователь уже есть (из TMA) → линкует account
   → если новый → создаёт запись
```

> [!IMPORTANT]
> Нужно добавить Cloud Function для account linking по email. Текущий `auth.ts` бэкенд работает только с Telegram HMAC. Это **единственное backend-изменение**.

---

## Инвайты через контакты

```
Текущий flow (TMA):    Ввести email → отправить invite на почту
Новый flow (Mobile):   expo-contacts picker → выбрать контакт → 
                       отправить push notification (если в приложении)
                       или SMS/deep link (если нет)
```

Нужна новая Cloud Function для invite-by-contact + проверка "есть ли этот email/phone в системе".

---

## Фазы реализации

### Phase 1 — Foundation (3-5 дней)
- Инициализация Expo проекта в `packages/mobile`
- Настройка pnpm workspace linking с `contracts` и `shared`
- Platform adapter для `shared` Firebase init (`.web.ts` / `.native.ts`)
- Theme tokens, базовый `_layout.tsx`
- Проверка что stores из `shared` работают в RN

### Phase 2 — Core Screens (5-7 дней)
- Auth screen (Apple/Google Sign-In)
- Account linking Cloud Function (backend)
- Main screen с bottom nav (tab layout)
- UI kit: Button, Input, FormField, Select, Spinner
- Postcard компонент
- Карусель (FlatList slider)

### Phase 3 — Gift Mechanics (5-7 дней)
- ScratchCanvas на Skia + gesture handler
- FlipFlap 3D анимация на Reanimated
- LockOverlay с countdown
- GiftBack с QR + code copy
- Invite flow через контакты
- Push notifications (FCM setup + handlers)

### Phase 4 — Polish (3-5 дней)
- Shadow system оптимизация (тестирование на слабых Android)
- Анимации press/appear/exit
- Haptic feedback на всех интерактивных элементах
- Deep linking для gift sharing
- Edge cases, error states, loading states
