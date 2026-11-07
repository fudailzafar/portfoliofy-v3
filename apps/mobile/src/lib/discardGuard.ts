import { usePreventRemove, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

/**
 * Asks before leaving a screen with entries that have not been kept. Leave
 * through the returned `leave` after saving, so it doesn't ask again.
 */
export function useDiscardGuard(dirty: boolean, what = 'this entry') {
  const router = useRouter();
  const [discarded, setDiscarded] = useState(false);

  const disablePrevention = usePreventRemove(
    dirty && !discarded,
    ({ repeat }) => {
      Alert.alert(`Discard ${what}?`, 'What you entered has not been kept.', [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setDiscarded(true);
            repeat();
          },
        },
      ]);
    },
  );

  const leave = useCallback(() => {
    disablePrevention();
    router.back();
  }, [disablePrevention, router]);

  return { leave };
}
