import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

export default function SignIn() {
  const { signIn, signingIn, canSignIn, error } = useAuth();
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          accessibilityLabel="Portfoliofy"
        />
        <Text style={[styles.title, { color: theme.text }]}>
          Sign in to Portfoliofy
        </Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          You will sign in on portfoliofy.site with Google or an email link,
          then come straight back here.
        </Text>
        {error && (
          <Text accessibilityRole="alert" style={{ color: theme.danger }}>
            {error}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <Button
          title="Continue"
          onPress={signIn}
          disabled={!canSignIn}
          loading={signingIn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 24 },
  content: { flex: 1, justifyContent: 'center', gap: 12 },
  logo: { width: 56, height: 56, borderRadius: 12, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '500' },
  body: { fontSize: 14, lineHeight: 22 },
  actions: { paddingBottom: 24 },
});
