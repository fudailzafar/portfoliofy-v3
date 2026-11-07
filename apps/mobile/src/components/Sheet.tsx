import { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTheme } from '@/lib/theme';

/** A panel that slides up from the bottom, for choices and actions. */
export function Sheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const theme = useTheme();
  const { height } = useWindowDimensions();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        accessibilityLabel="Close"
        style={styles.backdrop}
        onPress={onClose}
      />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.background,
            borderColor: theme.border,
            maxHeight: height * 0.7,
          },
        ]}
      >
        {title ? (
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        ) : null}
        <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </View>
    </Modal>
  );
}

export function SheetOption({
  label,
  onPress,
  selected,
  danger,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  danger?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        { opacity: pressed ? 0.6 : 1, borderColor: theme.border },
      ]}
    >
      <Text
        style={{
          color: danger ? theme.danger : theme.text,
          fontSize: 16,
          fontWeight: selected ? '600' : '400',
        }}
      >
        {label}
      </Text>
      {selected ? (
        <Text style={{ color: theme.textSecondary }}>Selected</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  option: {
    minHeight: 48,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
