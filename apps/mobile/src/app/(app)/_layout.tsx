import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/theme';

export default function AppLayout() {
  const theme = useTheme();
  const username = useQuery({
    queryKey: ['username'],
    queryFn: () => api.getUsername(),
  });

  if (username.isPending) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.text} />
      </View>
    );
  }

  if (username.isError) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          We could not load your profile. Check your connection and try again.
        </Text>
        <Button title="Try again" onPress={() => username.refetch()} />
      </View>
    );
  }

  const hasProfile = !!username.data;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasProfile}>
        <Stack.Screen name="index" />
        <Stack.Screen name="edit" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="insights" />
        <Stack.Screen name="domain" />
      </Stack.Protected>
      <Stack.Protected guard={!hasProfile}>
        <Stack.Screen name="claim" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  message: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
});
