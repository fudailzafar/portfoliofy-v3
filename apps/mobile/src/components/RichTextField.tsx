import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { SITE_URL } from '@/lib/config';
import { FieldLabel } from './fields';

// The editor itself is a page on portfoliofy.site (app/embed/rich-text), the
// same Tiptap setup the website uses, so formatting is identical on both. This
// component feeds it HTML and receives changes and its height.

const MIN_HEIGHT = 165;

type FromPage =
  | { type: 'ready' }
  | { type: 'change'; html: string }
  | { type: 'height'; value: number };

export function RichTextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  // The package's typings default its generic to `undefined`, which makes the
  // props `never`; naming `object` explicitly gives them their real shape.
  const webView = useRef<WebView<object>>(null);
  const ready = useRef(false);
  // The last HTML the page told us about, so our own echo isn't sent back.
  const lastFromPage = useRef(value);
  const [height, setHeight] = useState(MIN_HEIGHT);

  const uri = useMemo(() => {
    const params = new URLSearchParams({ theme: scheme });
    if (placeholder) params.set('placeholder', placeholder);
    return `${SITE_URL}/embed/rich-text?${params.toString()}`;
    // The page is loaded once; value changes go in through send().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheme]);

  const send = useCallback((html: string) => {
    webView.current?.injectJavaScript(
      `window.__setContent && window.__setContent(${JSON.stringify(html)}); true;`,
    );
  }, []);

  // A change that did not come from typing here, such as discarding edits.
  useEffect(() => {
    if (ready.current && value !== lastFromPage.current) {
      lastFromPage.current = value;
      send(value);
    }
  }, [value, send]);

  const onMessage = (event: WebViewMessageEvent) => {
    let message: FromPage;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (message.type === 'ready') {
      ready.current = true;
      lastFromPage.current = value;
      send(value);
    } else if (message.type === 'change') {
      lastFromPage.current = message.html;
      onChange(message.html);
    } else if (message.type === 'height') {
      setHeight(Math.max(MIN_HEIGHT, message.value));
    }
  };

  return (
    <View style={styles.field}>
      <FieldLabel>{label}</FieldLabel>
      <View style={{ height }}>
        <WebView<object>
          ref={webView}
          source={{ uri }}
          originWhitelist={[SITE_URL]}
          // Only the editor page itself may load in here.
          onShouldStartLoadWithRequest={(request) =>
            request.url.startsWith(`${SITE_URL}/embed/`)
          }
          onMessage={onMessage}
          scrollEnabled={false}
          overScrollMode="never"
          setSupportMultipleWindows={false}
          style={styles.webView}
          containerStyle={styles.webView}
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  webView: { backgroundColor: 'transparent' },
});
