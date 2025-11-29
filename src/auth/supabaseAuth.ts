import { supabase } from '../lib/supabase';

export type Role = 'instructor' | 'student';

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function register(email: string, password: string, role: Role, code?: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error('User ID missing after signUp');

  // Attach role and optional classroom code to profile row
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({ id: userId, role, classroom_code: code ?? null });
  if (profileErr) throw profileErr;

  return data.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
