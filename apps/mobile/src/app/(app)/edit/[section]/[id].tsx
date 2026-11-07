import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { isReversedRange } from '@portfoliofy/shared/validation/dates';
import {
  Entry,
  getSection,
  SectionConfig,
  SectionField,
  yearOptions,
} from '@portfoliofy/shared/sections';
import { useResumeList } from '@portfoliofy/shared/hooks/useResumeList';
import { AttachmentsField } from '@/components/AttachmentsField';
import { Button } from '@/components/Button';
import { FieldError, TextField } from '@/components/fields';
import { RichTextField } from '@/components/RichTextField';
import { Screen } from '@/components/Screen';
import { SelectField } from '@/components/SelectField';
import { useDiscardGuard } from '@/lib/discardGuard';
import { useTheme } from '@/lib/theme';

export default function EntryScreen() {
  const { section: sectionId, id } = useLocalSearchParams<{
    section: string;
    id: string;
  }>();
  const config = getSection(sectionId);
  if (!config) return <Missing text="This section is not available." />;
  return <Form key={`${config.id}:${id}`} config={config} entryId={id} />;
}

function Missing({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <Screen>
      <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{text}</Text>
    </Screen>
  );
}

const keyOf = (field: SectionField): string =>
  field.kind === 'yearRange' ? field.startKey : field.key;

const isBlank = (value: unknown) =>
  typeof value !== 'string' || value.trim() === '';

function Form({ config, entryId }: { config: SectionConfig; entryId: string }) {
  const currentYear = new Date().getFullYear();
  const { items, handleSave } = useResumeList<any>(config.storeKey);
  const isNew = entryId === 'new';
  const existing = isNew ? undefined : items.find((i) => i.id === entryId);

  const [initial] = useState<Entry | undefined>(
    () => existing ?? (isNew ? config.newEntry(currentYear) : undefined),
  );
  const [draft, setDraft] = useState<Entry>(initial ?? {});
  const [attempted, setAttempted] = useState(false);
  const [saved, setSaved] = useState(false);

  const dirty = !saved && JSON.stringify(draft) !== JSON.stringify(initial);
  const { leave } = useDiscardGuard(dirty);

  if (!initial) return <Missing text="This entry could not be found." />;

  const set = (key: string, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  // Fields marked with * are required; the range also must not run backwards.
  const requiredMissing = (field: SectionField): boolean => {
    if (field.kind === 'yearRange') {
      return isBlank(draft[field.startKey]) || isBlank(draft[field.endKey]);
    }
    return 'label' in field && field.label.endsWith('*')
      ? isBlank(draft[field.key])
      : false;
  };

  const submit = () => {
    setAttempted(true);
    if (!config.isValid(draft)) return;
    handleSave(draft);
    setSaved(true);
    leave();
  };

  const years = yearOptions(currentYear).map((y) => ({
    label: String(y),
    value: String(y),
  }));
  const yearsWithNow = [{ label: 'Now', value: 'Now' }, ...years];

  return (
    <Screen
      footer={
        <Button
          title={isNew ? config.addLabel : 'Save entry'}
          onPress={submit}
        />
      }
    >
      <Stack.Screen
        options={{ title: isNew ? config.addLabel : `Edit ${config.singular}` }}
      />
      {config.fields.map((field) => {
        const key = keyOf(field);
        const showMissing = attempted && requiredMissing(field);

        if (field.kind === 'yearRange') {
          const reversed = isReversedRange(
            draft[field.startKey],
            draft[field.endKey],
          );
          return (
            <View key={key} style={styles.group}>
              <View style={styles.pair}>
                <SelectField
                  label={field.startLabel}
                  value={draft[field.startKey]}
                  options={years}
                  onChange={(value) => set(field.startKey, value)}
                  placeholder="Year"
                  error={
                    showMissing && isBlank(draft[field.startKey])
                      ? 'Required'
                      : null
                  }
                />
                <SelectField
                  label={field.endLabel}
                  value={draft[field.endKey]}
                  options={yearsWithNow}
                  onChange={(value) => set(field.endKey, value)}
                  placeholder="Year"
                  invalid={reversed}
                  error={
                    !reversed && showMissing && isBlank(draft[field.endKey])
                      ? 'Required'
                      : null
                  }
                />
              </View>
              {reversed ? (
                <FieldError>
                  End year can&apos;t be earlier than the start year.
                </FieldError>
              ) : null}
            </View>
          );
        }

        if (field.kind === 'year') {
          return (
            <View key={key} style={styles.pair}>
              <SelectField
                label={field.label}
                value={draft[field.key]}
                options={years}
                onChange={(value) => set(field.key, value)}
                placeholder="Year"
                error={showMissing ? 'Required' : null}
              />
            </View>
          );
        }

        if (field.kind === 'richText') {
          return (
            <RichTextField
              key={key}
              label={field.label}
              value={draft[field.key] ?? ''}
              onChange={(html) => set(field.key, html)}
            />
          );
        }

        return (
          <TextField
            key={key}
            label={field.label}
            value={draft[field.key] ?? ''}
            onChangeText={(value) => set(field.key, value)}
            placeholder={field.placeholder}
            keyboardType={field.kind === 'url' ? 'url' : undefined}
            error={showMissing ? 'Required' : null}
          />
        );
      })}
      <AttachmentsField
        value={draft.attachments}
        onChange={(attachments) =>
          setDraft((current) => ({ ...current, attachments }))
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  pair: { flexDirection: 'row', gap: 12 },
});
