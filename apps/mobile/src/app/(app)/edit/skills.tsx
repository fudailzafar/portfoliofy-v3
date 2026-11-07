import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useResumeStore } from '@portfoliofy/shared/store/useResumeStore';
import { Button } from '@/components/Button';
import { TextField } from '@/components/fields';
import { Screen } from '@/components/Screen';
import { useDraftResume } from '@/lib/editor';
import { useTheme } from '@/lib/theme';

export default function Skills() {
  const theme = useTheme();
  const resume = useDraftResume();
  const updateHeader = useResumeStore((state) => state.updateHeader);
  const [input, setInput] = useState('');
  const skills = resume.header.skills ?? [];

  const add = () => {
    const skill = input.trim();
    if (!skill || skills.includes(skill)) return;
    updateHeader({ skills: [...skills, skill] });
    setInput('');
  };

  return (
    <Screen>
      <TextField
        label="Add a skill"
        value={input}
        onChangeText={setInput}
        placeholder="e.g. Software Development"
      />
      <Button title="Add" onPress={add} />
      {skills.length === 0 ? (
        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
          Skills you add show on your profile.
        </Text>
      ) : (
        <View style={styles.chips}>
          {skills.map((skill, index) => (
            <Pressable
              key={`${skill}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${skill}`}
              onPress={() =>
                updateHeader({ skills: skills.filter((_, i) => i !== index) })
              }
              style={[styles.chip, { borderColor: theme.border }]}
            >
              <Text style={{ color: theme.text, fontSize: 14 }}>{skill}</Text>
              <Text style={{ color: theme.textMuted, fontSize: 14 }}>✕</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
});
