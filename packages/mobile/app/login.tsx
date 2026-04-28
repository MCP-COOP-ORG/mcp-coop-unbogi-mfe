import { authApi } from '@unbogi/shared';
import { Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  Pattern,
  Rect,
  Stop,
  Image as SvgImage,
  RadialGradient as SvgRadialGradient,
} from 'react-native-svg';
import { colors, spacing, typography } from '@/theme';
import { Button, Input } from '@/ui';

const LOGO = require('../assets/logo-7.png');
const PATTERN = require('../assets/bg-pattern-3.png');
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }
    setLoading(true);
    try {
      await authApi.sendEmailOtp(email);
      setStep('code');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to send OTP');
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
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Base SVG with Radial Gradients, Polka Dots, and Cake Pattern */}
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            {/* Cyan gradient at top-left */}
            <SvgRadialGradient id="grad1" cx="0%" cy="0%" r="130%" fx="0%" fy="0%">
              <Stop offset="0%" stopColor="rgb(15, 231, 234)" stopOpacity="0.91" />
              <Stop offset="100%" stopColor="rgb(15, 231, 234)" stopOpacity="0" />
            </SvgRadialGradient>

            {/* Yellow gradient at bottom-right */}
            <SvgRadialGradient id="grad2" cx="100%" cy="100%" r="130%" fx="100%" fy="100%">
              <Stop offset="0%" stopColor="rgb(221, 201, 19)" stopOpacity="0.89" />
              <Stop offset="100%" stopColor="rgb(221, 201, 19)" stopOpacity="0" />
            </SvgRadialGradient>

            {/* Purple gradient at center */}
            <SvgRadialGradient id="grad3" cx="50%" cy="50%" r="100%" fx="50%" fy="50%">
              <Stop offset="0%" stopColor="rgb(106, 44, 164)" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="rgb(106, 44, 164)" stopOpacity="0" />
            </SvgRadialGradient>

            {/* Polka Dots Pattern */}
            <Pattern id="polka" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <Circle cx="12" cy="12" r="2.5" fill="rgb(129, 24, 205)" fillOpacity="0.2" />
            </Pattern>

            {/* Cake Pattern (scaled to match TMA's 180px width, centered) */}
            <Pattern
              id="cake"
              x={WINDOW_WIDTH / 2}
              y={WINDOW_HEIGHT / 2}
              width="180"
              height="206"
              patternUnits="userSpaceOnUse"
            >
              <SvgImage href={PATTERN} x="0" y="0" width="180" height="206" preserveAspectRatio="none" />
            </Pattern>
          </Defs>

          {/* Render each layer over the full screen */}
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad3)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#polka)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#cake)" opacity="0.9" />
        </Svg>
      </View>

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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#11051c', // --color-bg-start
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
});
