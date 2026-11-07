import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  isValidDomainFormat,
  normalizeDomain,
} from '@portfoliofy/shared/validation/domain';
import { Button } from '@/components/Button';
import { TextField } from '@/components/fields';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api';
import { messageFor } from '@/lib/editor';
import { useTheme } from '@/lib/theme';

export default function Domain() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const domain = useQuery({
    queryKey: ['domain'],
    queryFn: () => api.getDomain(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['domain'] });
  const connect = useMutation({
    mutationFn: (name: string) => api.connectDomain(name),
    onSuccess: () => {
      setInput('');
      setAttempted(false);
      return refresh();
    },
  });
  const disconnect = useMutation({
    mutationFn: () => api.disconnectDomain(),
    onSuccess: refresh,
  });

  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(text);
    setTimeout(
      () => setCopied((current) => (current === text ? null : current)),
      2000,
    );
  };

  const submit = () => {
    setAttempted(true);
    const name = normalizeDomain(input);
    if (!isValidDomainFormat(name)) return;
    connect.mutate(name);
  };

  const state = domain.data;
  const invalid = attempted && !isValidDomainFormat(input);

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Custom domain',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />

      {domain.isPending ? (
        <Text style={{ color: theme.textMuted, fontSize: 14 }}>Loading…</Text>
      ) : domain.isError ? (
        <View style={styles.group}>
          <Text style={{ color: theme.danger, fontSize: 14 }}>
            We could not load your domain.
          </Text>
          <Button title="Try again" onPress={() => domain.refetch()} />
        </View>
      ) : (
        <>
          {state?.domain ? (
            <View style={styles.group}>
              <Text style={[styles.domain, { color: theme.text }]} selectable>
                {state.domain}
              </Text>
              {state.statusUnavailable ? (
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 14,
                    lineHeight: 22,
                  }}
                >
                  We could not check this domain’s status just now. Try again in
                  a moment.
                </Text>
              ) : state.verified ? (
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 14,
                    lineHeight: 22,
                  }}
                >
                  Connected. Your profile is served at this address.
                </Text>
              ) : (
                <View style={styles.group}>
                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 14,
                      lineHeight: 22,
                    }}
                  >
                    Add this record where you manage your domain’s DNS. It can
                    take a while to take effect.
                  </Text>
                  {state.record ? (
                    <View
                      style={[styles.record, { borderColor: theme.border }]}
                    >
                      <RecordLine label="Type" value={state.record.type} />
                      <RecordLine label="Host" value={state.record.host} />
                      <RecordLine
                        label="Value"
                        value={state.record.value}
                        copied={copied === state.record.value}
                        onCopy={() => copy(state.record!.value)}
                      />
                    </View>
                  ) : null}
                </View>
              )}
              <Button
                title="Check again"
                onPress={() => domain.refetch()}
                loading={domain.isFetching}
              />
              <Button
                title="Disconnect domain…"
                variant="danger"
                loading={disconnect.isPending}
                onPress={() =>
                  Alert.alert(
                    `Disconnect ${state.domain}?`,
                    'Your profile will stop being served at this address.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Disconnect',
                        style: 'destructive',
                        onPress: () => disconnect.mutate(),
                      },
                    ],
                  )
                }
              />
              {disconnect.isError && (
                <Text accessibilityRole="alert" style={{ color: theme.danger }}>
                  {messageFor(disconnect.error)}
                </Text>
              )}
            </View>
          ) : (
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 14,
                lineHeight: 22,
              }}
            >
              Serve your profile at your own address, like yourname.com.
            </Text>
          )}

          <View style={styles.group}>
            <TextField
              label={state?.domain ? 'Use a different domain' : 'Domain'}
              value={input}
              onChangeText={setInput}
              placeholder="example.com"
              keyboardType="url"
              error={invalid ? 'Enter a domain like example.com' : null}
            />
            {connect.isError && (
              <Text accessibilityRole="alert" style={{ color: theme.danger }}>
                {messageFor(connect.error)}
              </Text>
            )}
            <Button
              title={state?.domain ? 'Replace domain' : 'Connect domain'}
              onPress={submit}
              loading={connect.isPending}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

function RecordLine({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={styles.line}>
      <View style={styles.lineText}>
        <Text style={{ color: theme.textMuted, fontSize: 12 }}>{label}</Text>
        <Text style={{ color: theme.text, fontSize: 14 }} selectable>
          {value}
        </Text>
      </View>
      {onCopy ? (
        <Button title={copied ? 'Copied' : 'Copy'} onPress={onCopy} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 12 },
  domain: { fontSize: 20, fontWeight: '500' },
  record: { borderWidth: 1, borderRadius: 6, padding: 12, gap: 12 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lineText: { flex: 1, gap: 2 },
});
