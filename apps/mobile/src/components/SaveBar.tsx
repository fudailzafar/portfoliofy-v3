import { Alert, StyleSheet, Text, View } from 'react-native';
import { useEditor, messageFor } from '@/lib/editor';
import { useTheme } from '@/lib/theme';
import { Button } from './Button';

/** Shown while there are unsaved edits: save them, or throw them away. */
export function SaveBar() {
  const theme = useTheme();
  const {
    dirty,
    saving,
    saveError,
    conflict,
    save,
    discard,
    reloadFromServer,
  } = useEditor();

  if (!dirty && !saveError) return null;

  const confirmDiscard = () =>
    Alert.alert('Discard changes?', 'Your unsaved edits will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: discard },
    ]);

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: theme.background, borderColor: theme.border },
      ]}
    >
      {saveError ? (
        <Text
          accessibilityRole="alert"
          style={{ color: theme.danger, fontSize: 14, lineHeight: 20 }}
        >
          {messageFor(saveError)}
        </Text>
      ) : (
        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
          You have unsaved changes.
        </Text>
      )}
      <View style={styles.actions}>
        {conflict ? (
          <View style={styles.action}>
            <Button
              title="Reload latest"
              onPress={() =>
                Alert.alert(
                  'Reload the latest version?',
                  'Your unsaved edits will be replaced by what was saved elsewhere.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Reload',
                      style: 'destructive',
                      onPress: () => void reloadFromServer(),
                    },
                  ],
                )
              }
            />
          </View>
        ) : (
          <>
            <View style={styles.action}>
              <Button
                title="Discard"
                onPress={confirmDiscard}
                disabled={saving}
              />
            </View>
            <View style={styles.action}>
              <Button
                title="Save changes"
                onPress={() => void save()}
                loading={saving}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1 },
});
