import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import {
  buildContactUrl,
  CONTACT_PLATFORMS,
  extractUsername,
} from '@portfoliofy/shared/extractUsername';
import { useResumeList } from '@portfoliofy/shared/hooks/useResumeList';
import { Button } from '@/components/Button';
import { TextField } from '@/components/fields';
import { Screen } from '@/components/Screen';
import { SelectField } from '@/components/SelectField';
import { useDiscardGuard } from '@/lib/discardGuard';
import { useTheme } from '@/lib/theme';

// The form works on a type, a handle and a link; only the platform and link
// are kept on the profile.
interface Draft {
  id?: string;
  hidden?: boolean;
  type: string;
  platform: string;
  username: string;
  link: string;
}

const TYPE_OPTIONS = CONTACT_PLATFORMS.map((p) => ({ label: p, value: p }));

export default function ContactScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, handleSave } = useResumeList<any>('contacts');
  const isNew = id === 'new';
  const existing = isNew ? undefined : items.find((c) => c.id === id);
  const theme = useTheme();

  const [initial] = useState<Draft | null>(() => {
    if (existing) {
      const isKnown = (CONTACT_PLATFORMS as readonly string[]).includes(
        existing.platform,
      );
      return {
        id: existing.id,
        hidden: existing.hidden,
        type: isKnown ? existing.platform : 'Custom',
        platform: existing.platform,
        link: existing.link,
        username: extractUsername(existing.link, existing.platform),
      };
    }
    return isNew ? { type: '', platform: '', username: '', link: '' } : null;
  });
  const [draft, setDraft] = useState<Draft>(
    initial ?? { type: '', platform: '', username: '', link: '' },
  );
  const [attempted, setAttempted] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = !saved && JSON.stringify(draft) !== JSON.stringify(initial);
  const { leave } = useDiscardGuard(dirty, 'this contact');

  if (!initial) {
    return (
      <Screen>
        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
          This contact could not be found.
        </Text>
      </Screen>
    );
  }

  const isCustom = draft.type === 'Custom';
  const isWebsite = draft.type === 'Website';
  const isEmail = draft.type === 'Email';
  const valid = !!draft.platform.trim() && !!draft.link.trim();

  const chooseType = (type: string) => {
    const custom = type === 'Custom';
    setDraft((current) => ({
      ...current,
      type,
      platform: custom ? current.platform : type,
      link: custom ? current.link : buildContactUrl(current.username, type),
    }));
  };

  const submit = () => {
    setAttempted(true);
    if (!valid) return;
    handleSave({
      id: draft.id,
      hidden: draft.hidden ?? false,
      platform: draft.platform.trim(),
      link: draft.link.trim(),
    });
    setSaved(true);
    leave();
  };

  return (
    <Screen
      footer={
        <Button
          title={isNew ? 'Add contact' : 'Save contact'}
          onPress={submit}
        />
      }
    >
      <Stack.Screen
        options={{ title: isNew ? 'Add contact' : 'Edit contact' }}
      />
      <SelectField
        label="Type*"
        value={draft.type}
        options={TYPE_OPTIONS}
        onChange={chooseType}
        placeholder="Select type"
        error={attempted && !draft.type ? 'Required' : null}
      />

      {isCustom && (
        <TextField
          label="Name of platform*"
          value={draft.platform}
          onChangeText={(platform) =>
            setDraft((current) => ({ ...current, platform }))
          }
          error={attempted && !draft.platform.trim() ? 'Required' : null}
        />
      )}

      {isCustom ? (
        <TextField
          label="URL*"
          value={draft.link}
          onChangeText={(link) =>
            setDraft((current) => ({
              ...current,
              link,
              username: extractUsername(link, current.platform),
            }))
          }
          keyboardType="url"
          error={attempted && !draft.link.trim() ? 'Required' : null}
        />
      ) : isWebsite ? (
        <TextField
          label="Website URL*"
          value={draft.link}
          onChangeText={(link) =>
            setDraft((current) => ({
              ...current,
              link,
              username: extractUsername(link, current.platform),
            }))
          }
          keyboardType="url"
          error={attempted && !draft.link.trim() ? 'Required' : null}
        />
      ) : draft.type ? (
        <TextField
          label={isEmail ? 'Email address*' : 'Username or Profile URL*'}
          value={draft.username}
          onChangeText={(username) =>
            setDraft((current) => ({
              ...current,
              username,
              link: buildContactUrl(username, current.platform),
            }))
          }
          keyboardType={isEmail ? 'email-address' : undefined}
          autoCapitalize="none"
          error={attempted && !draft.link.trim() ? 'Required' : null}
        />
      ) : null}
    </Screen>
  );
}
