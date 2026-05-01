/**
 * Legacy barrel — re-exports shared/ui components + feature-specific modules
 * that haven't been moved yet (gifts, modals).
 *
 * Prefer importing directly from '@/shared/ui' in new code.
 */

export type { ButtonIconProps, ButtonLayout, ButtonProps, ButtonVariant, InputProps, TextareaProps } from '@/shared/ui';
export { BottomNav, Button, EmptyState, Input, Spinner, Textarea } from '@/shared/ui';
export * from './gifts';
export * from './invite-modal';
export * from './send-form-modal';
