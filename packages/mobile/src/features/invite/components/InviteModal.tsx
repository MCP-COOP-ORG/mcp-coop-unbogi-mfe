import { CheckCircle, Mail } from 'lucide-react-native';
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Button, Input } from '@/shared/ui';
import { useModalStore } from '@/store';
import { colors, neoBrut, radii, spacing } from '@/theme';
import { useInviteForm } from '../hooks/useInviteForm';

const BIRD_IMAGE = require('../../../../assets/bird.png');

const t = {
  title: 'Invite a Friend',
  subtitle: 'Send an exclusive invitation link directly to their email.',
  success: 'Invite Sent!',
  emailRequired: 'Email is required',
  emailInvalid: 'Please enter a valid email address',
  emailPlaceholder: 'friend@example.com',
  close: 'Close',
  cancel: 'Cancel',
  send: 'Send',
};

export function InviteModal() {
  const activeModal = useModalStore((s) => s.activeModal);
  const isOpen = activeModal === 'invite';

  const {
    email,
    submitStatus,
    isTouched,
    isEmailValid,
    isLoading,
    setEmail,
    handleSubmit,
    handleClose,
    setSubmitStatusIdle,
    markTouched,
  } = useInviteForm();

  const showEmailError = isTouched && !isEmailValid;
  const currentError =
    submitStatus === 'error'
      ? 'Failed to send invite'
      : showEmailError
        ? email.length === 0
          ? t.emailRequired
          : t.emailInvalid
        : undefined;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <Animated.View entering={ZoomIn.springify().damping(20).stiffness(200)} style={styles.modalContainer}>
          <View style={styles.content}>
            <Image source={BIRD_IMAGE} style={styles.birdImage} resizeMode="contain" />
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>

            {submitStatus === 'success' ? (
              <Animated.View entering={ZoomIn} style={styles.successContainer}>
                <CheckCircle color="#10b981" size={40} strokeWidth={1.5} style={styles.successIcon} />
                <Text style={styles.successText}>{t.success}</Text>
              </Animated.View>
            ) : (
              <View style={styles.formContainer}>
                <Input
                  keyboardType="email-address"
                  leftIcon={<Mail color={colors.ink} size={20} strokeWidth={2.5} />}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (submitStatus === 'error') setSubmitStatusIdle();
                  }}
                  onBlur={markTouched}
                  placeholder={t.emailPlaceholder}
                  editable={!isLoading}
                  error={currentError}
                  onSubmitEditing={handleSubmit}
                  autoCapitalize="none"
                />
              </View>
            )}
          </View>

          <View style={styles.footer}>
            {submitStatus === 'success' ? (
              <Button layout="rectangle" variant="cyan" onPress={handleClose} style={styles.flex1}>
                {t.close}
              </Button>
            ) : (
              <>
                <Button
                  layout="rectangle"
                  variant="transparent"
                  status={isLoading ? 'disabled' : 'idle'}
                  onPress={handleClose}
                  style={styles.flex1}
                >
                  {t.cancel}
                </Button>
                <Button
                  layout="rectangle"
                  variant={isEmailValid ? 'lime' : 'cyan'}
                  status={isLoading ? 'loading' : 'idle'}
                  onPress={handleSubmit}
                  style={styles.flex1}
                >
                  {t.send}
                </Button>
              </>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
    ...neoBrut.card,
    backgroundColor: colors.warmBg,
    borderRadius: radii.modal,
  },
  content: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  birdImage: {
    width: 80,
    height: 80,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textBrown,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(74, 58, 53, 0.7)',
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    height: 80,
  },
  successIcon: {
    marginBottom: spacing.xs,
  },
  successText: {
    color: colors.textBrown,
    fontWeight: '500',
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: spacing.md,
  },
  flex1: {
    flex: 1,
  },
});
