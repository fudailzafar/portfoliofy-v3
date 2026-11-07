import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Linking, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PUBLIC_SITE_URL } from '@/lib/config';
import { useTheme } from '@/lib/theme';

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();
  const username = useQuery({
    queryKey: ['username'],
    queryFn: () => api.getUsername(),
  });
  const resume = useQuery({
    queryKey: ['resume'],
    queryFn: () => api.getResume(),
  });

  const name = resume.data?.resumeData?.header?.name;
  const profileUrl = username.data
    ? `${PUBLIC_SITE_URL}/${username.data}`
    : null;

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          {name ? `Hi, ${name}` : 'Your profile'}
        </Text>
        {profileUrl && (
          <Text
            selectable
            style={[styles.body, { color: theme.textSecondary }]}
          >
            {profileUrl.replace('https://', '')}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <Button title="Edit profile" onPress={() => router.push('/edit')} />
        <Button title="Settings" onPress={() => router.push('/settings')} />
        {profileUrl && (
          <>
            <Button
              title="Share profile"
              onPress={() => Share.share({ message: profileUrl })}
            />
            <Button
              title="View profile"
              onPress={() => Linking.openURL(profileUrl)}
            />
          </>
        )}
        <Button title="Sign out" onPress={signOut} variant="danger" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 24 },
  content: { flex: 1, justifyContent: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '500' },
  body: { fontSize: 14, lineHeight: 22 },
  actions: { gap: 12, paddingBottom: 24 },
});
