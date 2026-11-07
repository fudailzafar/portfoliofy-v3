import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { TextField } from '@/components/fields';
import { Screen } from '@/components/Screen';
import { SelectField } from '@/components/SelectField';
import { api } from '@/lib/api';
import {
  AppearancePreference,
  loadAppearance,
  saveAppearance,
} from '@/lib/appearance';
import { useAuth } from '@/lib/auth';
import { MOBILE_CLIENT_ID } from '@/lib/config';
import { messageFor } from '@/lib/editor';
import { useTheme } from '@/lib/theme';

const APPEARANCE_OPTIONS = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const APPEARANCE_HELP: Record<AppearancePreference, string> = {
  system: 'Follows your phone’s dark mode',
  light: 'Always appears light',
  dark: 'Always appears dark',
};

function relativeTime(date: string): string {
  const hours = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
  if (hours < 1) return 'less than an hour ago';
  const format = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return hours < 24
    ? format.format(-hours, 'hour')
    : format.format(-Math.floor(hours / 24), 'day');
}

export default function Settings() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const [appearance, setAppearance] = useState<AppearancePreference>('system');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [typedUsername, setTypedUsername] = useState('');

  useEffect(() => {
    loadAppearance().then(setAppearance);
  }, []);

  const username = useQuery({
    queryKey: ['username'],
    queryFn: () => api.getUsername(),
  });
  const apps = useQuery({
    queryKey: ['connected-apps'],
    queryFn: () => api.listConnectedApps(),
  });

  const disconnect = useMutation({
    mutationFn: (clientId: string) => api.disconnectApp(clientId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['connected-apps'] }),
  });

  const deleteAccount = useMutation({
    mutationFn: () => api.deleteAccount(),
    // The account and its sign-ins are gone, so end the session here too.
    onSuccess: () => signOut(),
  });

  // This app's own sign-ins are managed by signing out, not listed here.
  const otherApps = (apps.data ?? []).filter(
    (app) => app.clientId !== MOBILE_CLIENT_ID,
  );

  const usernameMatches =
    !!username.data &&
    typedUsername.trim().toLowerCase() === username.data.toLowerCase();

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />

      <SelectField
        label="Appearance"
        value={appearance}
        options={APPEARANCE_OPTIONS}
        onChange={(value) => {
          const preference = value as AppearancePreference;
          setAppearance(preference);
          void saveAppearance(preference);
        }}
      />
      <Text style={[styles.help, { color: theme.textMuted }]}>
        {APPEARANCE_HELP[appearance]}
      </Text>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          Connected apps
        </Text>
        {apps.isPending ? (
          <Text style={{ color: theme.textMuted, fontSize: 14 }}>Loading…</Text>
        ) : apps.isError ? (
          <Text style={{ color: theme.danger, fontSize: 14 }}>
            We could not load your connected apps.
          </Text>
        ) : otherApps.length === 0 ? (
          <Text
            style={{ color: theme.textMuted, fontSize: 14, lineHeight: 22 }}
          >
            No apps are connected. AI apps you connect to your profile show up
            here.
          </Text>
        ) : (
          otherApps.map((app) => (
            <View
              key={app.clientId}
              style={[styles.appRow, { borderColor: theme.border }]}
            >
              <View style={styles.appText}>
                <Text style={{ color: theme.text, fontSize: 16 }}>
                  {app.clientName}
                </Text>
                <Text
                  style={{
                    color: theme.textMuted,
                    fontSize: 12,
                    lineHeight: 18,
                  }}
                >
                  {app.scopes.includes('profile:write')
                    ? 'Can read and change your profile'
                    : 'Can read your profile'}
                  {'. '}
                  {app.lastUsedAt
                    ? `Used ${relativeTime(app.lastUsedAt)}.`
                    : 'Not used yet.'}
                </Text>
              </View>
              <Button
                title="Disconnect"
                loading={
                  disconnect.isPending && disconnect.variables === app.clientId
                }
                onPress={() =>
                  Alert.alert(
                    `Disconnect ${app.clientName}?`,
                    'It will lose access to your profile straight away.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Disconnect',
                        style: 'destructive',
                        onPress: () => disconnect.mutate(app.clientId),
                      },
                    ],
                  )
                }
              />
            </View>
          ))
        )}
        {disconnect.isError && (
          <Text accessibilityRole="alert" style={{ color: theme.danger }}>
            {messageFor(disconnect.error)}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>Account</Text>
        <Button title="Sign out" onPress={() => void signOut()} />
        {!confirmingDelete ? (
          <Button
            title="Delete account…"
            variant="danger"
            onPress={() => setConfirmingDelete(true)}
          />
        ) : (
          <View style={styles.deleteBox}>
            <Text
              style={{ color: theme.textMuted, fontSize: 14, lineHeight: 22 }}
            >
              Deleting your account cannot be undone, your data will be
              permanently erased. To continue type your username.
            </Text>
            <TextField
              label="Your username"
              value={typedUsername}
              onChangeText={setTypedUsername}
              autoCapitalize="none"
            />
            {deleteAccount.isError && (
              <Text accessibilityRole="alert" style={{ color: theme.danger }}>
                {messageFor(deleteAccount.error)}
              </Text>
            )}
            <View style={styles.actions}>
              <View style={styles.action}>
                <Button
                  title="Cancel"
                  disabled={deleteAccount.isPending}
                  onPress={() => {
                    setConfirmingDelete(false);
                    setTypedUsername('');
                  }}
                />
              </View>
              <View style={styles.action}>
                <Button
                  title="Delete account"
                  variant="danger"
                  disabled={!usernameMatches}
                  loading={deleteAccount.isPending}
                  onPress={() => deleteAccount.mutate()}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  help: { fontSize: 12, marginTop: -8 },
  section: { gap: 12, marginTop: 12 },
  heading: { fontSize: 14, fontWeight: '500' },
  appRow: {
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  appText: { gap: 2 },
  deleteBox: { gap: 12 },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1 },
});
