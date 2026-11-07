import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  isValidWebsite,
  normalizeWebsite,
} from '@portfoliofy/shared/validation/url';
import { isValidUsernameFormat } from '@portfoliofy/shared/validation/username';
import { useResumeStore } from '@portfoliofy/shared/store/useResumeStore';
import { TextField } from '@/components/fields';
import { RichTextField } from '@/components/RichTextField';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api';
import { useDraftResume } from '@/lib/editor';
import { useTheme } from '@/lib/theme';

type Availability = 'unchecked' | 'checking' | 'available' | 'taken' | 'failed';

export default function General() {
  const theme = useTheme();
  const resume = useDraftResume();
  const uname = useResumeStore((state) => state.uname);
  const setUname = useResumeStore((state) => state.setUname);
  const updateHeader = useResumeStore((state) => state.updateHeader);
  const updateResume = useResumeStore((state) => state.updateResume);
  const [serverUsername, setServerUsername] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Availability>('unchecked');
  const { header, summary } = resume;

  // The username the account has now, to tell a change from the first value.
  useEffect(() => {
    api.getUsername().then(setServerUsername, () => setServerUsername(null));
  }, []);

  // Check a new username once typing pauses.
  useEffect(() => {
    if (!uname || uname === serverUsername || !isValidUsernameFormat(uname)) {
      setAvailability('unchecked');
      return;
    }
    setAvailability('checking');
    const timer = setTimeout(() => {
      api.checkUsername(uname).then(
        (result) => setAvailability(result.available ? 'available' : 'taken'),
        () => setAvailability('failed'),
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [uname, serverUsername]);

  const usernameError =
    uname && !isValidUsernameFormat(uname)
      ? 'Use 2-30 characters: lowercase letters, numbers and hyphens.'
      : availability === 'taken'
        ? 'Username is taken.'
        : availability === 'failed'
          ? 'We could not check that username. It is checked again when you save.'
          : null;

  const website = header.website ?? '';
  const websiteError =
    website && !isValidWebsite(website) ? 'Enter a valid web address' : null;

  return (
    <Screen>
      <View style={styles.group}>
        <TextField
          label="Username*"
          value={uname}
          onChangeText={(value) =>
            setUname(value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
          }
          placeholder="your-username"
          autoCapitalize="none"
          maxLength={30}
          error={usernameError}
        />
        <Text style={{ color: theme.textMuted, fontSize: 12 }}>
          {availability === 'checking'
            ? 'Checking…'
            : availability === 'available'
              ? 'Available'
              : `portfoliofy.site/${uname || 'username'}`}
        </Text>
      </View>

      <TextField
        label="Display name*"
        value={header.name}
        onChangeText={(name) => updateHeader({ name })}
        placeholder="The name on your profile"
        maxLength={48}
      />
      <TextField
        label="What do you do?"
        value={header.shortAbout ?? ''}
        onChangeText={(shortAbout) => updateHeader({ shortAbout })}
        placeholder="Architect, painter, etc"
        maxLength={36}
      />
      <TextField
        label="Location"
        value={header.location ?? ''}
        onChangeText={(location) => updateHeader({ location })}
        placeholder="Where you're based"
      />
      <TextField
        label="Pronouns"
        value={header.pronouns ?? ''}
        onChangeText={(pronouns) => updateHeader({ pronouns })}
        placeholder="He/him, etc"
      />
      <TextField
        label="Website"
        value={website}
        onChangeText={(value) => updateHeader({ website: value })}
        placeholder="https://example.com"
        keyboardType="url"
        error={websiteError}
        onBlur={() => {
          // A bare "example.com" becomes a full address, as on the website.
          const normalized = normalizeWebsite(website);
          if (normalized !== website) updateHeader({ website: normalized });
        }}
      />
      <RichTextField
        label="About"
        value={summary ?? ''}
        onChange={(html) => updateResume({ summary: html })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ group: { gap: 4 } });
