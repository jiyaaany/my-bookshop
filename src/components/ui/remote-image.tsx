/**
 * Renders a record image from either a Supabase Storage path (resolved to a
 * short-lived signed URL) or a local `file://` / web uri (passed straight to
 * <Image>). Shows a muted placeholder while signing and on error.
 */

import { Image, type ImageStyle } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { createSignedUrl, isRemotePath } from '@/lib/supabase/storage';

export function RemoteImage({
  path,
  style,
  contentFit = 'cover',
}: {
  /** Storage path or local/web uri (see lib/supabase/storage). */
  path: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: 'cover' | 'contain';
}) {
  const theme = useTheme();
  const remote = isRemotePath(path);
  const [uri, setUri] = useState<string | null>(remote ? null : path);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!remote) {
      setUri(path);
      return;
    }
    let active = true;
    setUri(null);
    setFailed(false);
    createSignedUrl(path)
      .then((signed) => {
        if (active) {
          if (signed) setUri(signed);
          else setFailed(true);
        }
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [path, remote]);

  if (uri && !failed) {
    return (
      <Image source={{ uri }} style={style as StyleProp<ImageStyle>} contentFit={contentFit} transition={150} />
    );
  }
  return (
    <View style={[styles.placeholder, { backgroundColor: theme.surfaceMuted }, style]}>
      {!failed ? <ActivityIndicator size="small" color={theme.textSecondary} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: 'center', justifyContent: 'center' },
});
