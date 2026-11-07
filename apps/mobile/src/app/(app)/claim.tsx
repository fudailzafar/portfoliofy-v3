import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  isValidUsernameFormat,
  normalizeUsername,
} from '@portfoliofy/shared/validation/username';
import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/theme';

export default function Claim() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  const claim = useMutation({
    mutationFn: () =>
      api.claimProfile({
        username: normalizeUsername(username),
        displayName: displayName.trim(),
      }),
    // Once the profile exists, the username query turns up a value and the
    // layout swaps this screen for the home screen.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['username'] }),
        queryClient.invalidateQueries({ queryKey: ['resume'] }),
      ]),
  });

  const formatOk = isValidUsernameFormat(normalizeUsername(username));
  const canSubmit = displayName.trim().length > 0 && formatOk;

  const inputStyle = [
    styles.input,
    { color: theme.text, borderColor: theme.border },
  ];

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            Create your profile
          </Text>
          <Text style={[styles.body, { color: theme.textSecondary }]}>
            Choose the name and address people will see.
          </Text>

          <Text style={[styles.label, { color: theme.text }]}>Name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Jane Doe"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="words"
            maxLength={100}
            style={inputStyle}
          />

          <Text style={[styles.label, { color: theme.text }]}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="jane"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={30}
            style={inputStyle}
          />
          <Text style={[styles.hint, { color: theme.textMuted }]}>
            portfoliofy.site/{normalizeUsername(username) || 'username'}
          </Text>
          {username.length > 0 && !formatOk && (
            <Text style={{ color: theme.danger }}>
              Use 2-30 characters: lowercase letters, numbers and hyphens.
            </Text>
          )}
          {claim.isError && (
            <Text accessibilityRole="alert" style={{ color: theme.danger }}>
              {claim.error.message}
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          <Button
            title="Create profile"
            onPress={() => claim.mutate()}
            disabled={!canSubmit}
            loading={claim.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, paddingHorizontal: 24 },
  content: { flex: 1, justifyContent: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '500' },
  body: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', marginTop: 8 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  hint: { fontSize: 12 },
  actions: { paddingBottom: 24 },
});
