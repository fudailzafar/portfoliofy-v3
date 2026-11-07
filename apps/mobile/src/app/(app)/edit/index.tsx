import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  SECTION_LABELS,
  normalizeSectionOrder,
} from '@portfoliofy/shared/resume';
import { getSection } from '@portfoliofy/shared/sections';
import { useResumeStore } from '@portfoliofy/shared/store/useResumeStore';
import { Screen } from '@/components/Screen';
import { useDraftResume } from '@/lib/editor';
import { useTheme } from '@/lib/theme';

interface Row {
  id: string;
  label: string;
  count?: number;
  href: string;
}

export default function EditHome() {
  const theme = useTheme();
  const router = useRouter();
  const resume = useDraftResume();
  const updateResume = useResumeStore((state) => state.updateResume);
  const [reordering, setReordering] = useState(false);

  const order = normalizeSectionOrder(resume.sectionOrder);

  const countFor = (id: string): number | undefined => {
    if (id === 'skills') return resume.header.skills?.length ?? 0;
    if (id === 'contact') return resume.contacts?.length ?? 0;
    const section = getSection(id);
    return section ? (resume[section.storeKey]?.length ?? 0) : undefined;
  };

  const rows: Row[] = order
    .filter((id) => id === 'skills' || id === 'contact' || getSection(id))
    .map((id) => ({
      id,
      label: SECTION_LABELS[id] ?? id,
      count: countFor(id),
      href:
        id === 'skills'
          ? '/edit/skills'
          : id === 'contact'
            ? '/edit/contact'
            : `/edit/${id}`,
    }));

  const move = (index: number, by: -1 | 1) => {
    const next = [...order];
    const target = index + by;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    updateResume({ sectionOrder: next });
  };

  const orderIndex = (id: string) => order.indexOf(id);

  return (
    <Screen>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/edit/general')}
        style={[styles.row, styles.general, { borderColor: theme.border }]}
      >
        <Text style={{ color: theme.text, fontSize: 16 }}>General</Text>
        <Text
          style={{ color: theme.textMuted, fontSize: 14 }}
          numberOfLines={1}
        >
          {resume.header.name}
        </Text>
      </Pressable>

      <View style={styles.headingRow}>
        <Text style={[styles.heading, { color: theme.textSecondary }]}>
          Sections
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setReordering((value) => !value)}
          style={styles.headingAction}
        >
          <Text style={{ color: theme.text, fontSize: 14 }}>
            {reordering ? 'Done' : 'Reorder'}
          </Text>
        </Pressable>
      </View>

      <View>
        {rows.map((row) => {
          const index = orderIndex(row.id);
          return (
            <View
              key={row.id}
              style={[styles.row, { borderColor: theme.border }]}
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(row.href as never)}
                disabled={reordering}
                style={styles.rowMain}
              >
                <Text style={{ color: theme.text, fontSize: 16 }}>
                  {row.label}
                </Text>
                <Text style={{ color: theme.textMuted, fontSize: 14 }}>
                  {row.count ?? 0}
                </Text>
              </Pressable>
              {reordering ? (
                <View style={styles.reorder}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Move ${row.label} up`}
                    disabled={index <= 0}
                    onPress={() => move(index, -1)}
                    style={[styles.arrow, { opacity: index <= 0 ? 0.3 : 1 }]}
                  >
                    <Text style={{ color: theme.text, fontSize: 18 }}>▲</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Move ${row.label} down`}
                    disabled={index >= order.length - 1}
                    onPress={() => move(index, 1)}
                    style={[
                      styles.arrow,
                      { opacity: index >= order.length - 1 ? 0.3 : 1 },
                    ]}
                  >
                    <Text style={{ color: theme.text, fontSize: 18 }}>▼</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  general: { minHeight: 52, paddingRight: 4, gap: 12 },
  rowMain: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  heading: { fontSize: 12 },
  headingAction: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  reorder: { flexDirection: 'row' },
  arrow: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
