// Centralized API endpoint definitions and helpers
// Change base URL via Vite env: VITE_API_BASE_URL

export type OAuthProvider = "google" | "github" | "microsoft";

export const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "/api";

const join = (base: string, path: string) =>
  `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

export const ENDPOINTS = {
  auth: {
    login: join(API_BASE, "/auth/login"),
    signup: join(API_BASE, "/auth/signup"),
    me: join(API_BASE, "/auth/me"),
    logout: join(API_BASE, "/auth/logout"),
    password: {
      forgot: join(API_BASE, "/auth/password/forgot"),
      reset: join(API_BASE, "/auth/password/reset"),
    },
    oauth: {
      start(provider: OAuthProvider, redirectUri?: string) {
        const url = new URL(join(API_BASE, `/auth/oauth/${provider}/start`), window.location.origin);
        if (redirectUri) url.searchParams.set("redirect_uri", redirectUri);
        return url.toString().replace(window.location.origin, "");
      },
      callback: join(API_BASE, "/auth/oauth/callback"),
    },
  },
  pipelines: {
    list: join(API_BASE, "/pipelines"),
  },
} as const;

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    provider?: string;
  };
};
