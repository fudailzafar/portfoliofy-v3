import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { loadAppearance } from '@/lib/appearance';
import { AuthProvider, useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
      }),
  );

  // Light or dark, if the person chose one in Settings.
  useEffect(() => {
    void loadAppearance();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const { status } = useAuth();
  const theme = useTheme();

  // Until the saved session is read, show only the background colour, so
  // nobody sees the sign-in screen flash by.
  if (status === 'loading') {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={status === 'signedIn'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}
