import { ReactNode, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/lib/theme';
import { Sheet, SheetOption } from './Sheet';

export interface RowAction {
  label: string;
  onPress: () => void;
  danger?: boolean;
}

/** One entry in a list: tap to edit, the menu for everything else. */
export function EntryRow({
  title,
  subtitle,
  when,
  hidden,
  onPress,
  actions,
}: {
  title: string;
  subtitle?: string;
  when?: string;
  hidden?: boolean;
  onPress: () => void;
  actions: RowAction[];
}) {
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit ${title}`}
        onPress={onPress}
        style={({ pressed }) => [styles.main, { opacity: pressed ? 0.6 : 1 }]}
      >
        {when ? (
          <Text
            style={[styles.when, { color: theme.textMuted }]}
            numberOfLines={1}
          >
            {when}
          </Text>
        ) : null}
        <Text style={{ color: theme.text, fontSize: 16 }} numberOfLines={2}>
          {title || 'Untitled'}
          {subtitle ? (
            <Text style={{ color: theme.textSecondary }}>{subtitle}</Text>
          ) : null}
        </Text>
        {hidden ? (
          <Text style={{ color: theme.textMuted, fontSize: 12 }}>
            Hidden from your profile
          </Text>
        ) : null}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Actions for ${title || 'entry'}`}
        onPress={() => setMenuOpen(true)}
        style={styles.menu}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 20 }}>⋯</Text>
      </Pressable>
      <Sheet
        visible={menuOpen}
        title={title}
        onClose={() => setMenuOpen(false)}
      >
        {actions.map((action) => (
          <SheetOption
            key={action.label}
            label={action.label}
            danger={action.danger}
            onPress={() => {
              setMenuOpen(false);
              action.onPress();
            }}
          />
        ))}
      </Sheet>
    </View>
  );
}

/** Heading, description and add button over a list, with a friendly empty state. */
export function ListFrame({
  empty,
  emptyText,
  children,
}: {
  empty: boolean;
  emptyText: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  if (empty) {
    return (
      <View style={styles.empty}>
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          {emptyText}
        </Text>
      </View>
    );
  }
  return <View>{children}</View>;
}

/** Asks before a delete, since it can't be undone. */
export function confirmDelete(what: string, onConfirm: () => void) {
  Alert.alert(
    `Delete this ${what}?`,
    `This will permanently delete this ${what}. This action cannot be undone.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ],
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  main: { flex: 1, paddingVertical: 14, gap: 2 },
  when: { fontSize: 12, fontVariant: ['tabular-nums'] },
  menu: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { paddingVertical: 40, paddingHorizontal: 12 },
});
