import * as SecureStore from 'expo-secure-store';
import { Appearance } from 'react-native';

// Whether the app follows the phone's light/dark setting, or always uses one.
export type AppearancePreference = 'system' | 'light' | 'dark';

const KEY = 'portfoliofy.appearance';

function isPreference(value: unknown): value is AppearancePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

function apply(preference: AppearancePreference) {
  Appearance.setColorScheme(
    preference === 'system' ? 'unspecified' : preference,
  );
}

export async function loadAppearance(): Promise<AppearancePreference> {
  try {
    const stored = await SecureStore.getItemAsync(KEY);
    const preference = isPreference(stored) ? stored : 'system';
    apply(preference);
    return preference;
  } catch {
    return 'system';
  }
}

export async function saveAppearance(preference: AppearancePreference) {
  apply(preference);
  try {
    await SecureStore.setItemAsync(KEY, preference);
  } catch {
    // The choice still applies for this session.
  }
}
