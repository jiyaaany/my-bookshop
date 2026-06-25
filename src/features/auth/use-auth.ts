/**
 * Auth: Google sign-in via the Supabase browser OAuth flow (PKCE).
 *
 * Flow: signInWithOAuth(skipBrowserRedirect) → open the URL in an auth session
 * → catch the `mybookshop://auth-callback?code=…` redirect → exchangeCodeForSession.
 * Only the Supabase Google provider needs configuring; no Google client id in
 * the app. Falls back to no-op when Supabase isn't configured.
 */

import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

WebBrowser.maybeCompleteAuthSession();

function extractCode(url: string): string | null {
  try {
    return new URL(url).searchParams.get('code');
  } catch {
    const m = url.match(/[?&]code=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
}

export interface AuthState {
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getSupabase();
    if (!client) {
      setLoading(false);
      return;
    }
    let active = true;
    client.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    });
    const { data: sub } = client.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (): Promise<{ ok: boolean; error?: string }> => {
    const client = getSupabase();
    if (!client) return { ok: false, error: 'Supabase가 설정되지 않았어요 (.env 확인).' };

    const redirectTo = Linking.createURL('auth-callback');
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data?.url) return { ok: false, error: error?.message ?? '로그인 URL 생성 실패' };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return { ok: false, error: '로그인이 취소되었어요.' };

    const code = extractCode(result.url);
    if (!code) return { ok: false, error: '인증 코드를 받지 못했어요.' };

    const { error: exErr } = await client.auth.exchangeCodeForSession(code);
    if (exErr) return { ok: false, error: exErr.message };
    return { ok: true };
  };

  const signOut = async () => {
    await getSupabase()?.auth.signOut();
  };

  return { session, loading, configured: isSupabaseConfigured(), signInWithGoogle, signOut };
}
