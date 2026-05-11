// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { DefaultSession } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

type AuthToken = JWT & {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
};

type OAuthRefreshResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
};

type AppSession = DefaultSession & {
  accessToken?: string;
  error?: string;
};

async function refreshAccessToken(token: AuthToken): Promise<AuthToken> {
  try {
    if (!token.refreshToken) {
      return { ...token, error: 'RefreshAccessTokenError' };
    }

    const url = 'https://oauth2.googleapis.com/token';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });
    const refreshed = (await res.json()) as OAuthRefreshResponse;
    if (!res.ok) throw refreshed;
    return {
      ...token,
      accessToken: refreshed.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + (refreshed.expires_in ?? 3600),
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (e) {
    console.error('[NextAuth] Token refresh failed', e);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid', 'email', 'profile',
            'https://www.googleapis.com/auth/drive.file',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      const authToken = token as AuthToken;
      // First sign in
      if (account) {
        return {
          ...authToken,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        };
      }
      // Token still valid
      if (Date.now() < (authToken.expiresAt ?? 0) * 1000 - 60_000) {
        return authToken;
      }
      // Token expired — refresh
      return refreshAccessToken(authToken);
    },
    async session({ session, token }) {
      const appSession = session as AppSession;
      const authToken = token as AuthToken;
      appSession.accessToken = authToken.accessToken;
      appSession.error = authToken.error;
      return appSession;
    },
  },
  pages: { signIn: '/login' },
});

export { handler as GET, handler as POST };
