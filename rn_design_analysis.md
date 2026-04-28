# React Native — Кастомный vs Нативный дизайн

## Текущий UI: что имеем

17 компонентов, 2 экрана (Login, Main). Ключевые web-зависимости:

| Фича | Web API | Сложность портирования |
|:---|:---|:---:|
| **Shadow stack** (B1→W→B2→glow, 4 слоя boxShadow) | CSS `box-shadow` | 🔴 |
| **Scratch-механика** (рисование + pixel scan) | HTML Canvas 2D + touch events | 🔴 |
| **Flip-анимация** (3D поворот карточки) | CSS `perspective` + `preserve-3d` + `backfaceVisibility` | 🟡 |
| **Tab pill slide** (фон скользит между кнопками) | framer-motion `layoutId` | 🔴 |
| **Карусель** (snap scroll + dots) | `IntersectionObserver` + CSS snap | 🟢 |
| **Анимации** (press, appear, exit) | framer-motion variants/AnimatePresence | 🟡 |
| **Иконки** | lucide-react | 🟢 |
| **QR-код** | qrcode.react | 🟢 |
| **Clipboard** | navigator.clipboard | 🟢 |
| **Формы** (Input, Select, FormField) | HTML `<input>`, `<select>` | 🟢 |

---

## Вариант A: Кастомный дизайн (Neo-Brutalism в RN)

> Портируем текущий визуал 1-в-1 на React Native.

### Что будет просто
- **Карусель** → `FlatList` с `snapToInterval` + `onViewableItemsChanged`. Работает лучше чем web IntersectionObserver
- **Формы** (Input, Select) → `TextInput` + кастомный Picker. Тривиально
- **Иконки** → `lucide-react-native` (официальный пакет)
- **QR** → `react-native-qrcode-skia`
- **Clipboard** → `expo-clipboard`
- **Postcard, LockOverlay, GiftBack** → простые layout-компоненты, прямая переписка `View`/`Text`/`Image`
- **Design tokens** → `style-constants.ts` уже есть в TS, `theme.css` переносится в TS-объект за 10 минут

### Где будет больно

**1. Shadow Stack (🔴 главная проблема)**
Текущий дизайн — 4-слойный `boxShadow`: inner black → white ring → outer black → colored ambient glow. RN поддерживает **один** shadow на iOS и **только elevation** на Android. 

*Решения:* `react-native-shadow-2` (рендерит через SVG — работает, но ~15% overhead на старых Android) или пре-рендер теней как 9-patch images.

**2. Scratch Canvas (🔴 полная переписка)**
162 строки gesture-логики + 238 строк canvas-рендеринга. Всё на HTML Canvas 2D API. Замена: `@shopify/react-native-skia` (Skia Canvas) + `react-native-gesture-handler`.

*Нюанс:* Skia на мобильном на самом деле **быстрее** чем HTML Canvas — GPU-рендер, нативный. Но API совершенно другой. Переписка ~2-3 дня.

**3. layoutId анимация (🔴 нет аналога)**
Framer-motion `layoutId` — sliding pill между табами. В `react-native-reanimated` прямого аналога нет. Нужна кастомная `SharedValue` анимация позиции + ширины.

*Оценка:* ~1 день кастомной анимации.

**4. 3D Flip (🟡 другой API)**
CSS `perspective` + `rotateY` + `backfaceVisibility` → `react-native-reanimated` `withTiming`/`withSpring` + `transform: [{rotateY}]`. Концепт тот же, API другой.

### Перформанс с кастомным дизайном

| Аспект | Ожидание |
|:---|:---|
| Анимации (press, appear) | ✅ **Лучше чем web.** Reanimated работает на UI thread (60fps), framer-motion — на JS thread |
| Scratch | ✅ **Лучше.** Skia = нативный GPU vs software Canvas в WebView |
| Shadows | ⚠️ **Хуже.** Multi-layer shadows дорогие в RN. На старых Android может быть jank |
| Scroll/Carousel | ✅ **Лучше.** Нативный `FlatList` vs web overflow-scroll |
| Flip 3D | ✅ Сопоставимо. Reanimated UI thread transform |

---

## Вариант B: Нативный дизайн (Platform-adaptive)

> iOS → Human Interface Guidelines. Android → Material Design 3. Свои компоненты для каждой платформы.

### Что упрощается
- **Shadows** → iOS `shadowOffset/shadowRadius` (одинарный, но нативный). Android `elevation`. Никаких костылей
- **Кнопки** → `Pressable` с `Platform.select()` для стилей: iOS opacity feedback, Android ripple
- **Формы** → нативные стили ОС, пользователь чувствует себя "дома"
- **Navigation** → нативный back gesture (iOS swipe-back), Android hardware back
- **Tabs** → `@react-navigation/bottom-tabs` с нативными анимациями

### Что теряется
- **Бренд-идентичность.** Neo-Brutalism — это 100% того, что делает UI узнаваемым. Без него приложение выглядит generic
- **Консистентность с TMA.** Пользователь открывает TMA — видит Neo-Brutalism. Открывает mobile app — совсем другой UI. Когнитивный разрыв

### Перформанс с нативным дизайном

| Аспект | Ожидание |
|:---|:---|
| Всё | ✅ Идеальный. Нативные примитивы, ноль overhead |
| Scratch | Всё ещё Skia — тот же перформанс |

---

## Можно ли шарить UI между TMA и Mobile?

Три уровня шаринга, от простого к сложному:

### 1. `@unbogi/design-tokens` (✅ делать точно)
Выносим из `style-constants.ts` + `theme.css` в отдельный пакет:
```
colors, shadows (как числа/объекты), radii, spacing, typography
```
Оба UI (web и RN) импортируют токены и рендерят по-своему. Ноль coupling.

### 2. `@unbogi/ui-contracts` (✅ стоит делать)
Шарим TypeScript интерфейсы компонентов:
```
ButtonProps, InputProps, PostcardProps, SliderProps, etc.
```
Каждая платформа реализует свой рендер, но API идентичный. Гарантирует что mobile и TMA не дрифтуют по фичам.

### 3. `@unbogi/ui` — Universal Components (❌ не стоит)
Потребует `react-native-web` для рендера RN-компонентов в web. Это значит **переписать TMA** на RN-компоненты. Огромный scope, хрупкий результат, framer-motion и Tailwind придётся выбросить.

---

## Итого

| | Кастомный (Neo-Brutalism) | Нативный (iOS HIG / MD3) |
|:---|:---:|:---:|
| **Бренд-идентичность** | ✅ 100% | ❌ Потеряна |
| **Консистентность с TMA** | ✅ Один бренд | ❌ Два разных UI |
| **Сложность реализации** | 🟡 Средняя (shadows + scratch) | 🟢 Низкая |
| **Перформанс** | ⚠️ Shadows — единственная проблема | ✅ Идеальный |
| **Время** | 4-6 недель | 3-4 недели |
| **Переиспользование UI с TMA** | Токены + интерфейсы | Только токены |

> [!IMPORTANT]
> **Shadow stack — единственная реальная проблема кастомного дизайна.** Всё остальное портируется нормально или даже работает лучше (Skia, Reanimated). Если упростить тени до 2 слоёв вместо 4 — проблема исчезает, а визуал почти не страдает.
