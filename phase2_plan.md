# Phase 2 — Core Screens & UI Kit (Детальный план)

## Цель
К концу Phase 2 мобильное приложение должно иметь реализованный базовый UI Kit (Neo-Brutalism), настроенную навигацию с табами, рабочий экран авторизации (Apple/Google Sign-In) и готовую связку аккаунтов на бэкенде.

---

## Step 1 — UI Kit & Базовые компоненты (Neo-Brutalism)

**Что:** Перенести основные UI-компоненты из TMA в React Native, адаптировав стили и решить проблему с тенями.

- **Компоненты для реализации (`packages/mobile/src/ui/`):**
  - `Button.tsx` (кнопка с поддержкой состояний pressed/disabled)
  - `Input.tsx` / `FormField.tsx` (поля ввода)
  - `Spinner.tsx` (анимация загрузки)
- **Проблема с тенями:** В TMA используется 4-слойный `box-shadow` (inner black → white ring → outer black → colored ambient glow). RN не поддерживает множественные тени полноценно.
- **Решение:** Упростить shadow stack до 2 слоев (elevation + кастомный бордер) для сохранения производительности и избежания jank-ов на Android, либо использовать `react-native-shadow-2` если тени строго критичны для дизайна.

---

## Step 2 — Auth Screen & Social Sign-In

**Что:** Создать экран входа и настроить нативные провайдеры аутентификации.

- **Экран `app/login.tsx`:**
  - Дизайн в стиле Neo-Brutalism (заголовок, логотип, две кнопки авторизации).
- **iOS (Apple Sign-In):**
  - Настроить `expo-apple-authentication`.
  - Получить credential и передать в Firebase Auth.
- **Android (Google Sign-In):**
  - Настроить `@react-native-google-signin/google-signin`.
  - Интегрировать с Firebase Auth.
- **Связка с Zustand:** Обновить/адаптировать `useAuthStore` (из `@unbogi/shared`), чтобы он корректно обрабатывал статусы нативных логинов.

---

## Step 3 — Backend: Account Linking (Cloud Function)

**Что:** Доработать бэкенд для синхронизации аккаунтов между Telegram (TMA) и мобильным приложением.

- **Суть проблемы:** В TMA авторизация работает через Telegram HMAC, а в мобайле — через Apple/Google, которые привязаны к email.
- **Реализация:**
  - Написать новую Cloud Function в `packages/firebase` (например, `linkMobileAccount`).
  - **Флоу:** Мобильное приложение после успешного Apple/Google входа (получив токен Firebase) вызывает функцию. Функция проверяет email в коллекции `users`. Если email уже есть (пользователь пришел из TMA) — аккаунты связываются (merge). Если нет — создается новый пользователь.

---

## Step 4 — Навигация и Main Layout (Tabs)

**Что:** Настроить `expo-router` для главной части приложения.

- **Layout `app/(main)/_layout.tsx`:**
  - Настроить `<Tabs>` для нижней навигации (Bottom Nav).
- **Кастомный Bottom Nav (`packages/mobile/src/ui/bottom-nav.tsx`):**
  - Стилизовать tabBar под Neo-Brutalism.
  - Анимированное переключение табов (попытка адаптировать pill slide, возможно через `SharedValue` из `react-native-reanimated`).
- **Базовые экраны-заглушки:**
  - `app/(main)/surprises.tsx`
  - `app/(main)/collection.tsx`

---

## Step 5 — Сложные UI компоненты (Postcard & Carousel)

**Что:** Реализовать отображение подарочных карт и скроллинг.

- **Postcard (`packages/mobile/src/ui/postcard.tsx`):**
  - Верстка карточки с сохранением пропорций, закруглений и типографики.
- **Карусель подарков (`packages/mobile/src/ui/slider.tsx`):**
  - Заменить web IntersectionObserver на нативный `FlatList`.
  - Настроить `snapToInterval` и `decelerationRate="fast"` для идеального постраничного скролла (пагинации).
  - Индикаторы страниц (dots) через `onViewableItemsChanged`.

---

## Чеклист готовности Phase 2
- [ ] Базовый UI Kit (Button, Input) работает на iOS/Android без просадок FPS.
- [ ] Apple Sign-In работает на симуляторе/устройстве.
- [ ] Backend корректно мержит аккаунты по email.
- [ ] Навигация работает, табы переключаются с нативной плавностью.
- [ ] Карусель карточек (Postcard) скроллится с использованием FlatList.
