import { ReactNode } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '@/lib/theme';

export function FieldLabel({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <Text style={[styles.label, { color: theme.textSecondary }]}>
      {children}
    </Text>
  );
}

export function FieldError({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <Text
      accessibilityRole="alert"
      style={{ color: theme.danger, fontSize: 12 }}
    >
      {children}
    </Text>
  );
}

/** A labelled single-line input. Free text is accepted; checks show after. */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  autoCapitalize,
  maxLength,
  onBlur,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string | null;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  maxLength?: number;
}) {
  const theme = useTheme();
  const isLink = keyboardType === 'url' || keyboardType === 'email-address';
  return (
    <View style={styles.field}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        accessibilityLabel={label.replace('*', '')}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? (isLink ? 'none' : 'sentences')}
        autoCorrect={!isLink}
        spellCheck={!isLink}
        maxLength={maxLength}
        onBlur={onBlur}
        style={[
          styles.input,
          {
            color: theme.text,
            borderColor: error ? theme.danger : theme.border,
          },
        ]}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 12 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});
