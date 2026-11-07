import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/lib/theme';

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'default',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'danger';
}) {
  const theme = useTheme();
  // A busy button keeps its label, so it never changes size or meaning.
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.buttonBackground,
          borderColor: theme.border,
          opacity: inactive ? 0.5 : pressed ? 0.7 : 1,
        },
      ]}
    >
      {loading && <ActivityIndicator color={theme.text} size="small" />}
      <Text
        style={[
          styles.label,
          { color: variant === 'danger' ? theme.danger : theme.text },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 24,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 14, fontWeight: '500' },
});
