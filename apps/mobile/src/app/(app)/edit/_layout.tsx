import { Stack, usePreventRemove } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { SaveBar } from '@/components/SaveBar';
import { EditorProvider, useEditor } from '@/lib/editor';
import { useTheme } from '@/lib/theme';

export default function EditLayout() {
  return (
    <EditorProvider>
      <EditorFrame />
    </EditorProvider>
  );
}

function EditorFrame() {
  const theme = useTheme();
  const { status, dirty, discard, reloadFromServer } = useEditor();

  // Leaving the editor with unsaved edits asks first.
  usePreventRemove(dirty, ({ repeat }) => {
    Alert.alert(
      'Discard your changes?',
      'You have edits that have not been saved.',
      [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            discard();
            repeat();
          },
        },
      ],
    );
  });

  if (status !== 'ready') {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        {status === 'loading' ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <>
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              We could not load your profile. Check your connection and try
              again.
            </Text>
            <Button title="Try again" onPress={() => void reloadFromServer()} />
          </>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.frame, { backgroundColor: theme.background }]}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontSize: 16, fontWeight: '500' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Edit profile' }} />
        <Stack.Screen name="general" options={{ title: 'General' }} />
        <Stack.Screen name="skills" options={{ title: 'Skills' }} />
        <Stack.Screen name="contact/index" options={{ title: 'Contact' }} />
        <Stack.Screen name="contact/[id]" options={{ title: 'Contact' }} />
        <Stack.Screen name="[section]/index" options={{ title: '' }} />
        <Stack.Screen name="[section]/[id]" options={{ title: '' }} />
      </Stack>
      <SaveBar />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  message: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
});
