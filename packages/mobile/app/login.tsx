import auth from '@react-native-firebase/auth';
import { GoogleSignin, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { authApi } from '@unbogi/shared';
import { Mail } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, radii, shadows, sizing, spacing } from '@/theme';
import { Button, Input } from '@/ui';

const LOGO = require('../assets/logo-7.png');

/** Inline Google "G" logo — avoids external asset dependency */
function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Configure Google Sign-In once on mount
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const handleSendEmail = async () => {
    if (!email?.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }
    setLoading(true);
    try {
      await authApi.sendEmailOtp(email);
      setStep('code');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length < 6) {
      Alert.alert('Error', 'Please enter a valid code');
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyEmailOtp(email, code);
      // useAuthStore's onAuthStateChanged will pick up the login and redirect automatically
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const credential = auth.GoogleAuthProvider.credential(response.data.idToken);
        await auth().signInWithCredential(credential);
        // onAuthStateChanged in _layout.tsx will redirect to (main)
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled — do nothing
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services are not available on this device');
      } else {
        Alert.alert('Error', err.message || 'Google Sign-In failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Main Content */}
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
                      leftIcon={<Mail color="#1a1a1a" size={20} strokeWidth={2.5} />}
                      onSubmitEditing={handleSendEmail}
                      returnKeyType="go"
                    />
                  </View>
                  <View style={styles.buttonFlex}>
                    <Button
                      layout="circle"
                      variant="cyan"
                      icon="ChevronRight"
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
                      icon={code.length >= 6 ? 'Check' : 'ArrowLeft'}
                      onPress={code.length >= 6 ? handleVerify : () => setStep('email')}
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

            {/* Google Sign-In button */}
            {Platform.OS === 'android' && (
              <Pressable
                style={({ pressed }) => [styles.googleButton, pressed && styles.googleButtonPressed]}
                onPress={handleGoogleSignIn}
                disabled={googleLoading || loading}
              >
                {googleLoading ? <ActivityIndicator size="small" color={colors.ink} /> : <GoogleLogo size={20} />}
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
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  patternImage: {
    opacity: 0.9,
    resizeMode: 'repeat',
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
    minHeight: 48,
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    gap: 8,
  },
  inputFlex: {
    flex: 1,
    minWidth: 0,
  },
  buttonFlex: {
    width: 48,
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
    marginTop: 8,
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
    color: '#2b2a2c',
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
