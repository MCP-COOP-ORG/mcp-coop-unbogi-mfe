# Phase 2 — Core Screens & UI Kit (Детальный план)

## Цель
К концу Phase 2 мобильное приложение должно иметь реализованный базовый UI Kit (Neo-Brutalism), настроенную навигацию с табами и рабочий экран авторизации (только Email OTP), так как у нас пока нет аккаунта разработчика Apple.

---

## Step 1 — UI Kit & Базовые компоненты (Neo-Brutalism)

**Что:** Перенести основные UI-компоненты из TMA в React Native, адаптировав стили и решить проблему с тенями.

- **Компоненты для реализации (`packages/mobile/src/ui/`):**
  - `Button.tsx` (кнопка с поддержкой состояний pressed/disabled)
  - `Input.tsx` (поля ввода)
- **Проблема с тенями:** В TMA используется 4-слойный `box-shadow` (inner black → white ring → outer black → colored ambient glow). RN не поддерживает множественные тени полноценно.
- **Решение (на данный момент):** Сделать упрощенный shadow stack (приблизительно как в TMA) — используем `borderWidth` и смещенную жесткую тень (`shadowOffset` с `shadowRadius: 0`). Потом, если понадобится, переведем на `react-native-shadow-2` (Phase 4).

---

## Step 2 — Auth Screen (Только Email OTP)

**Что:** Создать базовый экран входа через Email OTP (One-Time Password / Magic Link). Никаких нативных Apple/Google входов пока нет аккаунта разработчика.

- **Экран `app/login.tsx`:**
  - Простой UI в стиле Neo-Brutalism (поле для email, кнопка отправки).
- **Логика (Firebase Auth):**
  - Подключение отправки кода/ссылки на email (стандартный механизм Firebase).
- **Связка с Zustand:** Использование существующего `useAuthStore` из `@unbogi/shared`.

---

## Step 3 — Навигация и Main Layout (Tabs)

**Что:** Настроить `expo-router` для главной части приложения.

- **Layout `app/(main)/_layout.tsx`:**
  - Настроить `<Tabs>` для нижней навигации (Bottom Nav).
- **Кастомный Bottom Nav (`packages/mobile/src/ui/bottom-nav.tsx`):**
  - Стилизовать tabBar под Neo-Brutalism.
- **Базовые экраны-заглушки:**
  - `app/(main)/surprises.tsx`
  - `app/(main)/collection.tsx`

---

## Чеклист готовности Phase 2
- [ ] Базовый UI Kit (Button, Input) работает на iOS/Android приблизительно похоже на TMA.
- [ ] Email OTP Sign-In работает на симуляторе/устройстве.
- [ ] Навигация работает, пользователь попадает на заглушку главного экрана после авторизации.

