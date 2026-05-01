import auth from '@react-native-firebase/auth';
import { GoogleSignin, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { isSignInError } from '@/shared/lib';

interface UseGoogleSignInResult {
  googleLoading: boolean;
  handleGoogleSignIn: () => Promise<void>;
}

export function useGoogleSignIn(): UseGoogleSignInResult {
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const credential = auth.GoogleAuthProvider.credential(response.data.idToken);
        await auth().signInWithCredential(credential);
      }
    } catch (error: unknown) {
      if (isSignInError(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          // User cancelled — do nothing
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          Alert.alert('Error', 'Google Play Services are not available on this device');
        } else {
          Alert.alert('Error', error.message ?? 'Google Sign-In failed');
        }
      } else {
        Alert.alert('Error', 'Google Sign-In failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return { googleLoading, handleGoogleSignIn };
}
