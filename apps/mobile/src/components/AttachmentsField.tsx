import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { messageFor } from '@/lib/editor';
import { pickImages, uploadImage } from '@/lib/media';
import { useTheme } from '@/lib/theme';
import { Button } from './Button';
import { FieldLabel } from './fields';

// As stored on an entry (see AttachmentSchema in the shared package).
export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'page';
  url?: string;
  filename?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

const newId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/**
 * Photos on an entry. Only photos are listed and changed here; pages and
 * videos attached from the website are kept as they are.
 */
export function AttachmentsField({
  value,
  onChange,
}: {
  value: Attachment[] | undefined;
  onChange: (next: Attachment[]) => void;
}) {
  const theme = useTheme();
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const attachments = value ?? [];
  const images = attachments.filter((a) => a.type === 'image' && a.url);

  const add = async () => {
    setError(null);
    const assets = await pickImages({ multiple: true });
    if (assets.length === 0) return;
    setUploading(assets.length);
    const added: Attachment[] = [];
    const failures: string[] = [];
    // One at a time keeps memory low with big photos, and a bad file doesn't
    // lose the others.
    for (const asset of assets) {
      try {
        const uploaded = await uploadImage(asset);
        added.push({
          id: newId(),
          type: 'image',
          url: uploaded.url,
          filename: uploaded.filename,
          width: uploaded.width,
          height: uploaded.height,
        });
      } catch (caught) {
        failures.push(messageFor(caught));
      }
      setUploading((count) => count - 1);
    }
    if (added.length > 0) onChange([...attachments, ...added]);
    if (failures.length > 0) {
      setError(
        failures.length === assets.length
          ? failures[0]
          : `${failures.length} of ${assets.length} photos could not be added.`,
      );
    }
  };

  return (
    <View style={styles.field}>
      <FieldLabel>Photos</FieldLabel>
      {images.length > 0 && (
        <View style={styles.grid}>
          {images.map((image) => (
            <View key={image.id} style={styles.cell}>
              <Image
                source={{ uri: image.url }}
                accessibilityLabel={image.filename ?? 'Photo'}
                style={[styles.thumb, { backgroundColor: theme.border }]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${image.filename ?? 'photo'}`}
                onPress={() =>
                  onChange(attachments.filter((a) => a.id !== image.id))
                }
                style={[styles.remove, { backgroundColor: theme.background }]}
              >
                <Text style={{ color: theme.text, fontSize: 14 }}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
      <Button
        title={uploading > 0 ? `Uploading ${uploading}…` : 'Add photos'}
        onPress={() => void add()}
        loading={uploading > 0}
      />
      {error ? (
        <Text
          accessibilityRole="alert"
          style={{ color: theme.danger, fontSize: 12 }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: 96, height: 96 },
  thumb: { width: 96, height: 96, borderRadius: 6 },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
});
