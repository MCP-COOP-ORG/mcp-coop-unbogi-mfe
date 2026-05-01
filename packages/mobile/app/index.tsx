import { Redirect } from 'expo-router';

export default function Index() {
  // _layout.tsx handles auth redirection, but we need an index point
  // We'll redirect to the main app layout. If unauthenticated, _layout will intercept
  // and send to /login.
  return <Redirect href="/surprises" />;
}
