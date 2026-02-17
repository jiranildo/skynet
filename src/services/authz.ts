import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

function toNormalizedEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true' || value.trim() === '1';
  return false;
}

function hasAdminMetadata(user: User): boolean {
  const appRole = String(user.app_metadata?.role ?? '').toLowerCase();
  const userRole = String(user.user_metadata?.role ?? '').toLowerCase();
  const appIsAdmin = toBoolean(user.app_metadata?.is_admin);
  const userIsAdmin = toBoolean(user.user_metadata?.is_admin);

  return appRole === 'admin' || userRole === 'admin' || appIsAdmin || userIsAdmin;
}

function getAdminEmailAllowlist(): Set<string> {
  const defaults = ['admin@socialhub.com'];
  const raw = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ?? '';
  const envEmails = raw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const emails = [...defaults, ...envEmails];

  return new Set(emails);
}

export async function isUserAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;

  if (hasAdminMetadata(user)) return true;

  const adminEmails = getAdminEmailAllowlist();
  const authEmail = toNormalizedEmail(user.email);
  if (authEmail && adminEmails.has(authEmail)) return true;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) return false;

    const role = String((data as any).role ?? '').toLowerCase();
    const isAdmin = toBoolean((data as any).is_admin);
    const profileEmail = toNormalizedEmail((data as any).email);

    return role === 'admin' || isAdmin || (profileEmail && adminEmails.has(profileEmail));
  } catch {
    return false;
  }
}
