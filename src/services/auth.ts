import http from "@/api/http";
import { ENDPOINTS, OAuthProvider, type LoginResponse } from "@/api/endpoints";

export type Credentials = { email: string; password: string };
export type SignupPayload = { name: string; email: string; password: string };

export async function login(credentials: Credentials): Promise<LoginResponse> {
  const res = await http.post(ENDPOINTS.auth.login, credentials);
  return res.data as LoginResponse;
}

export async function signup(payload: SignupPayload): Promise<LoginResponse> {
  const res = await http.post(ENDPOINTS.auth.signup, payload);
  return res.data as LoginResponse;
}

export function oauthStartUrl(provider: OAuthProvider, redirectUri?: string) {
  return ENDPOINTS.auth.oauth.start(provider, redirectUri);
}

export async function exchangeOauthCallback(params: Record<string, string>): Promise<LoginResponse> {
  // Supports generic callback contract: backend reads code/state/provider from query or cookie
  const res = await http.get(ENDPOINTS.auth.oauth.callback, { params });
  return res.data as LoginResponse;
}

export async function getMe() {
  const res = await http.get(ENDPOINTS.auth.me);
  return res.data;
}

