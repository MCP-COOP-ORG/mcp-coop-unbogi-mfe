/**
 * Firebase callable adapter — React Native
 *
 * Re-exports from @react-native-firebase/* with compatible signatures.
 * Metro picks this file over callable.web.ts thanks to .native.ts extension.
 */

export { onAuthStateChanged, signInWithCustomToken } from '@react-native-firebase/auth';
export { httpsCallable } from '@react-native-firebase/functions';
