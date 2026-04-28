import { invitesApi, isValidEmail } from '@unbogi/shared';
import { CheckCircle, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useInviteModalStore } from '../store';
import { Button } from './Button';
import { Input } from './Input';

const BIRD_IMAGE = require('../../assets/bird.png');

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

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
  errorGeneric: 'Failed to send invite',
};

export function InviteModal() {
  const { isInviteModalOpen, closeInviteModal } = useInviteModalStore();
  const [email, setEmail] = useState('');
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  const isEmailValid = isValidEmail(email);
  const showEmailError = isTouched && !isEmailValid;
  const currentError =
    submitStatus === 'error'
      ? errorMessage
      : showEmailError
        ? email.length === 0
          ? t.emailRequired
          : t.emailInvalid
        : undefined;

  const handleSubmit = async () => {
    setIsTouched(true);
    if (!email || !isEmailValid) return;

    setSubmitStatus('loading');
    try {
      await invitesApi.sendEmailInvite(email);
      setSubmitStatus('success');
      setTimeout(() => {
        closeInviteModal();
        setTimeout(() => {
          setSubmitStatus('idle');
          setEmail('');
        }, 300);
      }, 2000);
    } catch (err: unknown) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : t.errorGeneric);
    }
  };

  const handleClose = () => {
    closeInviteModal();
    setTimeout(() => {
      setSubmitStatus('idle');
      setEmail('');
      setErrorMessage('');
      setIsTouched(false);
    }, 300);
  };

  const isLoading = submitStatus === 'loading';

  return (
    <Modal
      visible={isInviteModalOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <Animated.View
          entering={ZoomIn.springify().damping(20).stiffness(200)}
          style={styles.modalContainer}
        >
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
                  leftIcon={<Mail color="#1a1a1a" size={20} strokeWidth={2.5} />}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (submitStatus === 'error') setSubmitStatus('idle');
                  }}
                  onBlur={() => setIsTouched(true)}
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
    backgroundColor: '#FFF5E1',
    borderRadius: 32,
    overflow: 'hidden',
    // Neo-Brutalism Shadow
    borderWidth: 2,
    borderColor: '#1a1a1a',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  birdImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A3A35',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(74, 58, 53, 0.7)',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    height: 80, // roughly same height as form to avoid jumping
  },
  successIcon: {
    marginBottom: 8,
  },
  successText: {
    color: '#4A3A35',
    fontWeight: '500',
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
    marginTop: 4,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  flex1: {
    flex: 1,
  },
});
