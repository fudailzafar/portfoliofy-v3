import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { getListAdjacency } from '@portfoliofy/shared/resume';
import { getSection, sortEntries } from '@portfoliofy/shared/sections';
import { useResumeList } from '@portfoliofy/shared/hooks/useResumeList';
import { Button } from '@/components/Button';
import { confirmDelete, EntryRow, ListFrame } from '@/components/EntryList';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/lib/theme';

export default function SectionList() {
  const { section: sectionId } = useLocalSearchParams<{ section: string }>();
  const config = getSection(sectionId);
  if (!config) return <NotFound />;
  return <List sectionId={config.id} />;
}

function NotFound() {
  const theme = useTheme();
  return (
    <Screen>
      <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
        This section is not available.
      </Text>
    </Screen>
  );
}

function List({ sectionId }: { sectionId: string }) {
  const router = useRouter();
  const theme = useTheme();
  const config = getSection(sectionId)!;
  const {
    items,
    handleMoveUp,
    handleMoveDown,
    handleToggleVisibility,
    handleDelete,
  } = useResumeList<any>(config.storeKey);

  const sorted = sortEntries(items);

  return (
    <Screen
      footer={
        <Button
          title={config.addLabel}
          onPress={() =>
            router.push({
              pathname: '/edit/[section]/[id]',
              params: { section: config.id, id: 'new' },
            } as never)
          }
        />
      }
    >
      <Stack.Screen options={{ title: config.label }} />
      <ListFrame empty={sorted.length === 0} emptyText={config.emptyLabel}>
        <View style={styles.list}>
          {sorted.map((entry: any, index: number) => {
            const row = config.describe(entry);
            const { prevItem, nextItem, canMoveUp, canMoveDown } =
              getListAdjacency(sorted, index);
            return (
              <EntryRow
                key={entry.id ?? index}
                title={row.title}
                subtitle={row.subtitle}
                when={row.when}
                hidden={entry.hidden}
                onPress={() =>
                  router.push({
                    pathname: '/edit/[section]/[id]',
                    params: { section: config.id, id: entry.id },
                  } as never)
                }
                actions={[
                  {
                    label: entry.hidden
                      ? 'Show on profile'
                      : 'Hide from profile',
                    onPress: () => handleToggleVisibility(entry),
                  },
                  ...(canMoveUp
                    ? [
                        {
                          label: 'Move up',
                          onPress: () => handleMoveUp(entry, prevItem),
                        },
                      ]
                    : []),
                  ...(canMoveDown
                    ? [
                        {
                          label: 'Move down',
                          onPress: () => handleMoveDown(entry, nextItem),
                        },
                      ]
                    : []),
                  {
                    label: 'Delete…',
                    danger: true,
                    onPress: () =>
                      confirmDelete(config.singular, () =>
                        handleDelete(entry.id),
                      ),
                  },
                ]}
              />
            );
          })}
        </View>
      </ListFrame>
      {sorted.length > 0 ? (
        <Text style={{ color: theme.textMuted, fontSize: 12 }}>
          Entries are listed newest first. Entries from the same period can be
          reordered.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ list: { marginHorizontal: -0 } });
