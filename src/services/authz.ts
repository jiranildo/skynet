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

export async function isUserSuperAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;

  const appRole = String(user.app_metadata?.role ?? '').toLowerCase();
  if (appRole === 'super_admin') return true;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) return false;
    return String((data as any).role).toLowerCase() === 'super_admin';
  } catch {
    return false;
  }
}

export async function isUserAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;

  const appRole = String(user.app_metadata?.role ?? '').toLowerCase();
  const userRole = String(user.user_metadata?.role ?? '').toLowerCase();

  if (['super_admin', 'admin'].includes(appRole) || ['super_admin', 'admin'].includes(userRole)) return true;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) return false;
    const role = String((data as any).role ?? '').toLowerCase();
    return ['super_admin', 'admin'].includes(role);
  } catch {
    return false;
  }
}

export async function isUserAgent(user: User | null): Promise<boolean> {
  if (!user) return false;

  const appRole = String(user.app_metadata?.role ?? '').toLowerCase();
  const userRole = String(user.user_metadata?.role ?? '').toLowerCase();

  if (['super_admin', 'agente', 'agent'].includes(appRole) || ['super_admin', 'agente', 'agent'].includes(userRole)) return true;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) return false;

    const role = String((data as any).role ?? '').toLowerCase();
    return ['super_admin', 'agente', 'agent'].includes(role);
  } catch {
    return false;
  }
}

export async function isUserSupplier(user: User | null): Promise<boolean> {
  if (!user) return false;

  const appRole = String(user.app_metadata?.role ?? '').toLowerCase();
  const userRole = String(user.user_metadata?.role ?? '').toLowerCase();

  if (['super_admin', 'fornecedor', 'supplier'].includes(appRole) || ['super_admin', 'fornecedor', 'supplier'].includes(userRole)) return true;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) return false;

    const role = String((data as any).role ?? '').toLowerCase();
    return ['super_admin', 'fornecedor', 'supplier'].includes(role);
  } catch {
    return false;
  }
}

