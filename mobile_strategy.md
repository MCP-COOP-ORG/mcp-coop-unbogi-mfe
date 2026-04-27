# 📱 UnBoGi Mobile — Архитектурный Выбор Стека

## Вводная: что у нас есть и что нужно

**Монорепа** на TypeScript/pnpm:
- `@unbogi/contracts` — Zod-схемы, типы, константы (чистый TS, ноль рантайма)
- `@unbogi/firebase` — Cloud Functions бэкенд (серверный, клиент его не знает)
- `@unbogi/shared` — Zustand stores + Firebase Web SDK + httpsCallable API-клиенты
- `@unbogi/tma` — Vite/React UI для Telegram (web-only: Canvas, Tailwind, framer-motion)

**Цель:** нативное мобильное приложение (iOS + Android) с текущим Neo-Brutalism дизайном и нативным поведением элементов (жесты, навигация, haptic, пуши).

---

## Три реальных варианта

### 1️⃣ React Native (Expo)

> Кроссплатформа на TypeScript. Один код → iOS + Android.

**Переиспользование кода из монорепы:**

| Пакет | Что происходит |
|:---|:---|
| `contracts` | ✅ Импортируется напрямую. Zod + TS работают в RN без изменений. Один `workspace:*` линк — и готово. |
| `shared` (stores) | ✅ Zustand работает в RN идентично. Stores (`useAuthStore`, `useGiftsStore`, etc.) — копипаст 0%. |
| `shared` (Firebase init) | 🔧 Нужна замена: `firebase` web SDK → `@react-native-firebase/*`. Это ~2 файла (`firebase/init.ts`, `firebase/app-check.ts`). API-обёртки (`httpsCallable`) — заменяются 1-в-1. |
| `shared` (API clients) | ⚠️ `httpsCallable` из web SDK → `httpsCallable` из `@react-native-firebase/functions`. Тот же интерфейс, другой импорт. Если абстрагировать через adapter — stores вообще не меняются. |
| `tma` (UI) | ❌ Не переиспользуется. Новые компоненты на `View`/`Text`/`Pressable`. |

**Ключевые маппинги технологий:**

| Web (сейчас) | React Native (замена) |
|:---|:---|
| `react-dom` | `react-native` |
| Tailwind CSS | `StyleSheet.create` или NativeWind 4 |
| `framer-motion` | `react-native-reanimated` 3 + `react-native-gesture-handler` |
| HTML `<canvas>` (scratch) | `@shopify/react-native-skia` |
| `qrcode.react` | `react-native-qrcode-skia` или `expo-barcode-generator` |
| Telegram QR scanner | `expo-camera` barcode scanning |
| `tg.haptic()` | `expo-haptics` (нативный Taptic Engine / Vibration API) |
| `tg.showBackButton()` | `@react-navigation` native back + Android hardware back |
| Firebase Web SDK | `@react-native-firebase/*` (нативные SDK под капотом) |
| CSS `var(--color-*)` | TS-объект `theme.colors.*` (уже есть аналог в `style-constants.ts`) |

**Архитектура в монорепе:**

```
packages/
├── contracts/      ← без изменений
├── firebase/       ← без изменений (серверная сторона)
├── shared/         ← абстрагировать Firebase init (adapter pattern)
├── tma/            ← без изменений, остаётся для Telegram
└── mobile/         ← НОВЫЙ: Expo/RN проект, консьюмер shared
```

**Плюсы:**
- TypeScript-first → вся команда уже знает язык
- `contracts` + `shared` stores переиспользуются нативно (Zod, Zustand — всё работает)
- Один инструментарий (pnpm, biome, vitest) на всю монорепу
- Expo managed workflow → OTA обновления, EAS Build, push notifications
- `@shopify/react-native-skia` — полноценный Canvas для scratch-механики
- `react-native-reanimated` — 60fps анимации на UI thread (не JS thread)
- Огромная экосистема + community

**Минусы:**
- UI переписывается с нуля (~15-20 компонентов) — но сам дизайн остаётся
- `react-native-reanimated` API отличается от `framer-motion` — learning curve
- RN bridge overhead для тяжёлых анимаций (Skia решает, но сложнее чем web Canvas)
- Expo managed mode ограничивает некоторые native modules (но EAS это решает)

**Оценка:** 4-6 недель до MVP

---

### 2️⃣ Flutter

> Кроссплатформа на Dart. Свой рендер-движок (Skia). Один код → iOS + Android.

**Переиспользование кода из монорепы:**

| Пакет | Что происходит |
|:---|:---|
| `contracts` | ❌ **Полная перепись на Dart.** Zod не существует в Dart. Нужен `freezed` + `json_serializable` или ручные модели. ~500 строк схем. |
| `shared` (stores) | ❌ **Полная перепись.** Zustand — JS-only. Замена: `riverpod` или `bloc`. Вся state-machine auth flow, gift lifecycle — переписать. |
| `shared` (API) | ❌ **Перепись.** `cloud_functions` Dart SDK имеет `httpsCallable`, но другой API. |
| `firebase` (backend) | ✅ Не трогаем — серверная сторона. |
| `tma` | ❌ Не переиспользуется. |

**Ключевые маппинги:**

| Web (сейчас) | Flutter (замена) |
|:---|:---|
| React components | Flutter Widgets |
| Zustand | Riverpod / BLoC |
| Zod schemas | `freezed` + `json_serializable` |
| `framer-motion` | Flutter implicit/explicit animations |
| HTML Canvas | `CustomPainter` (Skia под капотом — мощнее web Canvas) |
| TypeScript | Dart |
| pnpm workspace | `pub` (отдельный dependency manager) |

**Архитектура:**

```
packages/
├── contracts/      ← без изменений (для TMA)
├── firebase/       ← без изменений
├── shared/         ← без изменений (для TMA)
├── tma/            ← без изменений
└── mobile/         ← НОВЫЙ: Flutter проект, полностью отдельный стек
                       ├── lib/models/        ← переписанные contracts
                       ├── lib/services/      ← переписанные shared API/stores
                       └── lib/ui/            ← новый UI на виджетах
```

**Плюсы:**
- Skia-рендер → идеальный контроль над каждым пикселем (Neo-Brutalism будет pixel-perfect)
- `CustomPainter` для scratch-механики — нативнее и мощнее чем web Canvas
- Отличная анимационная система (implicit animations, Hero, curves)
- Hot reload — быстрая итерация UI
- Одна кодовая база для iOS + Android (как RN, но свой рендер без bridge)
- Mature ecosystem (Google backing)

**Минусы:**
- **Dart** — другой язык. Вся команда должна его знать или учить
- **Ноль переиспользования кода** из монорепы. Contracts, stores, API — всё переписывается
- **Два мира:** TS-монорепа (tma/shared/contracts) + Dart-проект (mobile). Дрифт контрактов — реальный риск. Изменил Zod-схему в contracts → забыл обновить Dart-модель → production bug
- Не вписывается в pnpm workspace → отдельный CI, отдельные линтеры, отдельный toolchain
- Flutter Web существует, но для Telegram Mini App не подходит (размер бандла 2-5MB)

**Оценка:** 6-10 недель до MVP (из-за переписки всей бизнес-логики)

---

### 3️⃣ Полный Натив (Swift + Kotlin)

> Два отдельных проекта. Максимальный нативный контроль.

**Переиспользование кода из монорепы:**

| Пакет | Что происходит |
|:---|:---|
| `contracts` | ❌ Перепись **дважды**: Swift (`Codable`) + Kotlin (`data class` + kotlinx.serialization) |
| `shared` | ❌ Перепись **дважды**: iOS (Combine/SwiftUI state) + Android (Kotlin Flow/Compose state) |
| `firebase` (backend) | ✅ Не трогаем |

**Архитектура:**

```
packages/
├── contracts/      ← для TMA
├── firebase/       ← серверная сторона
├── shared/         ← для TMA
├── tma/            ← для Telegram
├── ios/            ← Xcode проект: SwiftUI + Firebase iOS SDK
└── android/        ← Gradle проект: Jetpack Compose + Firebase Android SDK
```

**Плюсы:**
- Абсолютный максимум нативного feel — каждая платформа идеальна
- Нативные SDK Firebase — zero overhead
- SwiftUI и Compose — modern declarative UI (концептуально похожи на React)
- Полный доступ к платформенным API без bridge
- App Store / Play Store — никаких вопросов

**Минусы:**
- **Два полных проекта.** Каждая фича пишется дважды
- **Три языка** в монорепе: TypeScript + Swift + Kotlin
- **Ноль переиспользования** бизнес-логики
- **Тройной дрифт контрактов:** Zod (TS) ↔ Codable (Swift) ↔ data class (Kotlin). Изменение одной схемы → три файла в трёх языках
- Нужны спецы по каждой платформе (или один фулстек, который пишет и Swift, и Kotlin)
- Neo-Brutalism дизайн реализуется дважды — двойная работа для каждого нового компонента
- CI/CD: три разных пайплайна (GitHub Actions для TS, Xcode Cloud / Fastlane, Gradle)

**Оценка:** 10-16 недель до MVP (два параллельных проекта)

---

## Матрица сравнения

| Критерий | React Native (Expo) | Flutter | Swift + Kotlin |
|:---|:---:|:---:|:---:|
| **Переиспользование TS кода** | ~70% shared + 100% contracts | 0% | 0% |
| **Языковой стек** | TypeScript (уже знаешь) | Dart (учить) | Swift + Kotlin (учить оба) |
| **Кол-во кодовых баз UI** | 2 (tma + mobile) | 2 (tma + mobile) | 3 (tma + ios + android) |
| **Контракт-дрифт риск** | ⚡ Минимальный (один Zod) | ⚠️ Высокий (Zod ↔ Dart) | 🔴 Критический (Zod ↔ Swift ↔ Kotlin) |
| **Scratch Canvas** | `@shopify/react-native-skia` | `CustomPainter` (отличный) | Core Graphics + Android Canvas |
| **Анимации** | `reanimated` (UI thread, 60fps) | Implicit animations (отличные) | UIKit/SwiftUI + Compose (лучшие) |
| **Neo-Brutalism реализация** | 1 раз | 1 раз | 2 раза |
| **Firebase интеграция** | `@react-native-firebase` (mature) | `firebase_flutter` (хороший) | Нативные SDK (идеальные) |
| **Monorepo fit** | ✅ pnpm workspace | ❌ Отдельный pub | ❌ Отдельные Xcode/Gradle |
| **CI/CD** | EAS Build (один пайплайн) | Codemagic / отдельный | Три пайплайна |
| **Time to MVP** | 4-6 нед | 6-10 нед | 10-16 нед |
| **Стоимость поддержки** | Средняя | Средняя | Высокая (×2 UI) |
| **Нативный feel** | ⚠️ 85% | ⚠️ 80% (свой рендер) | ✅ 100% |

---

## Моё мнение как архитектора

> [!IMPORTANT]
> **Главный аргумент в пользу React Native — переиспользование `@unbogi/shared` и `@unbogi/contracts`.**

У тебя 5 domain stores (auth, gifts, contacts, holidays, invites) + Zod-контракты + вся auth state machine — это ~2000+ строк проверенной бизнес-логики. В Flutter и Native это **переписывается с нуля** и создаёт постоянный риск дрифта.

```
Стоимость фичи:
  React Native: contracts ✓ + shared ✓ + новый UI
  Flutter:      новые models + новый state + новые API clients + новый UI
  Native:       (новые models + state + API + UI) × 2 платформы
```

**Flutter** имеет смысл, если:
- У тебя есть Dart-разработчик или ты сам хочешь переходить на Dart
- Тебе критичен pixel-perfect рендер (свой Skia, не платформенный)
- Ты готов к полной изоляции mobile от TS-монорепы

**Native (Swift + Kotlin)** имеет смысл, если:
- Бюджет на отдельные iOS и Android команды
- Нужен 100% нативный feel без компромиссов
- Приложение станет основным продуктом (не addon к TMA)

**React Native (Expo)** имеет смысл, если:
- Ты хочешь максимизировать ROI от уже написанного кода
- Команда — TypeScript-first
- Приоритет — скорость выхода с Neo-Brutalism дизайном на обе платформы

> [!TIP]
> Независимо от выбора, **первый подготовительный шаг одинаковый:** абстрагировать Firebase init в `@unbogi/shared` через adapter pattern. Это 2-3 часа работы, и shared становится platform-agnostic для React Native (а для Flutter/Native всё равно переписывать).
