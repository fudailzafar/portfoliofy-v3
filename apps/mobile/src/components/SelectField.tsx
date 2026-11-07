import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/lib/theme';
import { FieldError, FieldLabel } from './fields';
import { Sheet, SheetOption } from './Sheet';

export interface Option {
  label: string;
  value: string;
}

/** A field that picks one value from a list, in a sheet. */
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  error,
  invalid,
}: {
  label: string;
  value: string | undefined;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  /** Red outline without a message, when the message is shown elsewhere. */
  invalid?: boolean;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.field}>
      <FieldLabel>{label}</FieldLabel>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label.replace('*', '')}: ${selected?.label ?? 'none'}`}
        onPress={() => setOpen(true)}
        style={[
          styles.input,
          { borderColor: error || invalid ? theme.danger : theme.border },
        ]}
      >
        <Text
          style={{
            color: selected ? theme.text : theme.textMuted,
            fontSize: 16,
          }}
        >
          {selected?.label ?? placeholder}
        </Text>
      </Pressable>
      {error ? <FieldError>{error}</FieldError> : null}
      <Sheet
        visible={open}
        title={label.replace('*', '')}
        onClose={() => setOpen(false)}
      >
        {options.map((option) => (
          <SheetOption
            key={option.value}
            label={option.label}
            selected={option.value === value}
            onPress={() => {
              onChange(option.value);
              setOpen(false);
            }}
          />
        ))}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6, flex: 1 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
});
