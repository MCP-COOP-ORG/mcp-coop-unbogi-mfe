import { ArrowLeft, Check, ChevronRight, Mail } from 'lucide-react-native';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Spinner } from '@/shared/ui';
import { colors, radii, shadows, sizing, spacing } from '@/theme';
import { useEmailOtp } from '../hooks/useEmailOtp';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';
import { GoogleLogo } from './GoogleLogo';

const LOGO = require('../../../../assets/logo-7.png');

/** Pure UI component — delegates all logic to hooks */
export function LoginScreen() {
  const { email, code, step, loading, setEmail, setCode, handleSendEmail, handleVerify, goBack } = useEmailOtp();
  const { googleLoading, handleGoogleSignIn } = useGoogleSignIn();

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
          <ScrollView contentContainerStyle={styles.innerContainer} keyboardShouldPersistTaps="handled" bounces={false}>
            {/* Logo */}
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />

            {/* Form Container */}
            <View style={styles.formContainer}>
              {step === 'email' ? (
                <View style={styles.inputRow}>
                  <View style={styles.inputFlex}>
                    <Input
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                      leftIcon={<Mail color={colors.ink} size={20} strokeWidth={2.5} />}
                      onSubmitEditing={handleSendEmail}
                      returnKeyType="go"
                    />
                  </View>
                  <View style={styles.buttonFlex}>
                    <Button
                      layout="circle"
                      variant="cyan"
                      icon={ChevronRight}
                      onPress={handleSendEmail}
                      status={loading ? 'loading' : !email.includes('@') ? 'disabled' : 'idle'}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.inputRow}>
                  <View style={styles.inputFlex}>
                    <Input
                      value={code}
                      onChangeText={setCode}
                      placeholder="6-digit code"
                      keyboardType="number-pad"
                      editable={!loading}
                      onSubmitEditing={handleVerify}
                      returnKeyType="go"
                      style={styles.codeInput}
                    />
                  </View>
                  <View style={styles.buttonFlex}>
                    <Button
                      layout="circle"
                      variant={code.length >= 6 ? 'lime' : 'red'}
                      icon={code.length >= 6 ? Check : ArrowLeft}
                      onPress={code.length >= 6 ? handleVerify : goBack}
                      status={loading ? 'loading' : 'idle'}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Hint text */}
            {step === 'code' && (
              <View style={styles.hintContainer}>
                <Text style={styles.hintText}>
                  Code sent to <Text style={styles.hintEmail}>{email}</Text>
                </Text>
              </View>
            )}

            {/* Google Sign-In — Android only */}
            {Platform.OS === 'android' && (
              <Pressable
                style={({ pressed }) => [styles.googleButton, pressed && styles.googleButtonPressed]}
                onPress={handleGoogleSignIn}
                disabled={googleLoading || loading}
              >
                {googleLoading ? <Spinner size={20} color={colors.ink} /> : <GoogleLogo size={20} />}
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </Pressable>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 240,
    height: 240,
  },
  formContainer: {
    width: '100%',
    maxWidth: 320,
    minHeight: sizing.inputHeight,
    marginTop: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    gap: spacing.xs,
  },
  inputFlex: {
    flex: 1,
    minWidth: 0,
  },
  buttonFlex: {
    width: sizing.inputHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeInput: {
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 2,
    fontSize: 20,
  },
  hintContainer: {
    marginTop: spacing.xs,
    alignItems: 'center',
    zIndex: 10,
  },
  hintText: {
    fontSize: 16,
    letterSpacing: 1.5,
    fontWeight: '700',
    color: 'rgba(43, 42, 44, 0.8)',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hintEmail: {
    color: colors.ink,
    textTransform: 'uppercase',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 320,
    height: sizing.buttonHeight,
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: radii.field,
    ...shadows.button,
  },
  googleButtonPressed: {
    transform: [{ translateX: 3 }, { translateY: 3 }],
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0.5,
  },
});
