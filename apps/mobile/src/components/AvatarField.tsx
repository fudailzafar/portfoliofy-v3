import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image, StyleSheet, Text, View } from 'react-native';
import { api } from '@/lib/api';
import { messageFor } from '@/lib/editor';
import { AVATAR_MAX_BYTES, pickImages, uploadImage } from '@/lib/media';
import { useTheme } from '@/lib/theme';
import { Button } from './Button';
import { FieldLabel } from './fields';

/** The profile picture. Unlike the other edits, it is saved as soon as it is chosen. */
export function AvatarField() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const account = useQuery({
    queryKey: ['account'],
    queryFn: () => api.getAccount(),
  });

  const change = useMutation({
    mutationFn: async () => {
      const [asset] = await pickImages({ square: true });
      if (!asset) return;
      const { url } = await uploadImage(asset, AVATAR_MAX_BYTES);
      await api.setAvatar(url);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['account'] }),
  });

  const remove = useMutation({
    mutationFn: () => api.removeAvatar(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['account'] }),
  });

  const image = account.data?.image;
  const error = change.error ?? remove.error;

  return (
    <View style={styles.field}>
      <FieldLabel>Profile picture</FieldLabel>
      <View style={styles.row}>
        {image ? (
          <Image
            source={{ uri: image }}
            accessibilityLabel="Your profile picture"
            style={[styles.avatar, { backgroundColor: theme.border }]}
          />
        ) : (
          <View
            accessibilityLabel="No profile picture"
            style={[styles.avatar, { backgroundColor: theme.border }]}
          />
        )}
        <View style={styles.actions}>
          <Button
            title={image ? 'Change photo' : 'Add photo'}
            onPress={() => change.mutate()}
            loading={change.isPending}
            disabled={remove.isPending}
          />
          {account.data?.hasCustomImage ? (
            <Button
              title="Remove photo"
              onPress={() => remove.mutate()}
              loading={remove.isPending}
              disabled={change.isPending}
            />
          ) : null}
        </View>
      </View>
      {error ? (
        <Text
          accessibilityRole="alert"
          style={{ color: theme.danger, fontSize: 12 }}
        >
          {messageFor(error)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  actions: { flex: 1, gap: 8 },
});
