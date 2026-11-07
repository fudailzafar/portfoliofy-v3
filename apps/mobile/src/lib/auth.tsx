import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useQueryClient } from '@tanstack/react-query';
import {
  OAUTH_CLIENT_ID,
  OAUTH_DISCOVERY,
  OAUTH_REDIRECT_URI,
  OAUTH_SCOPE,
} from './config';
import {
  completeSignIn,
  endSession,
  hasSession,
  onSessionExpired,
} from './tokens';

// Closes the sign-in browser when it hands control back to the app.
WebBrowser.maybeCompleteAuthSession();

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthValue {
  status: Status;
  /** True from tapping Sign in until the app has its session. */
  signingIn: boolean;
  /** Why the last attempt failed, for the sign-in screen. */
  error: string | null;
  /** False until the sign-in request is ready to open. */
  canSignIn: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>('loading');
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: OAUTH_CLIENT_ID,
      scopes: [OAUTH_SCOPE],
      redirectUri: makeRedirectUri({ native: OAUTH_REDIRECT_URI }),
      usePKCE: true,
    },
    OAUTH_DISCOVERY,
  );

  useEffect(() => {
    let cancelled = false;
    hasSession().then((signedIn) => {
      if (!cancelled) setStatus(signedIn ? 'signedIn' : 'signedOut');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () =>
      onSessionExpired(() => {
        queryClient.clear();
        setStatus('signedOut');
      }),
    [queryClient],
  );

  // The browser came back: swap the code for a session.
  useEffect(() => {
    if (!response) return;
    if (response.type === 'success' && request?.codeVerifier) {
      completeSignIn(response.params.code, request.codeVerifier)
        .then(() => setStatus('signedIn'))
        .catch(() => setError('We could not finish signing you in. Try again.'))
        .finally(() => setSigningIn(false));
    } else {
      if (response.type === 'error') {
        setError('Sign in did not go through. Try again.');
      }
      // 'dismiss' and 'cancel' mean the person closed the browser: no error.
      setSigningIn(false);
    }
    // `request` changes whenever a new attempt is prepared; only react to a
    // new response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const signIn = useCallback(() => {
    setError(null);
    setSigningIn(true);
    promptAsync().catch(() => {
      setError('We could not open the sign-in page. Try again.');
      setSigningIn(false);
    });
  }, [promptAsync]);

  const signOut = useCallback(async () => {
    await endSession();
    queryClient.clear();
    setStatus('signedOut');
  }, [queryClient]);

  const value = useMemo(
    () => ({
      status,
      signingIn,
      error,
      canSignIn: request !== null,
      signIn,
      signOut,
    }),
    [status, signingIn, error, request, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
