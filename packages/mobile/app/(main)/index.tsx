import { Redirect } from 'expo-router';

export default function MainIndex() {
  // Redirect to the default tab
  return <Redirect href="/(main)/surprises" />;
}
