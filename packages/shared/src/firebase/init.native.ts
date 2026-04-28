/**
 * Firebase platform adapter — React Native (Expo)
 *
 * Uses @react-native-firebase/* native SDKs.
 * Config is read from google-services.json (Android) / GoogleService-Info.plist (iOS).
 * No import.meta.env — native SDKs handle config automatically.
 *
 * Metro bundler picks this file over init.web.ts thanks to the .native.ts extension.
 */
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFunctions } from '@react-native-firebase/functions';

// Native SDKs auto-initialize from google-services.json / GoogleService-Info.plist
export const app = getApp();
export const auth = getAuth(app);
export const functions = getFunctions(app, 'europe-west1');
