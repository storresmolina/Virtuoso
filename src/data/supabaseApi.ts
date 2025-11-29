import { supabase } from '../lib/supabase';

export type ClassroomCode = {
  id: string;
  code: string;
  used: boolean;
  created_at: string;
};

export type StudentRow = {
  id: string;
  email: string | null;
  name: string | null;
  created_at: string;
};

export async function createOneUseCode(): Promise<ClassroomCode> {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const { data, error } = await supabase
    .from('classroom_codes')
    .insert({ code, used: false })
    .select()
    .single();
  if (error) throw error;
  return data as ClassroomCode;
}

export async function listCodes(): Promise<ClassroomCode[]> {
  const { data, error } = await supabase
    .from('classroom_codes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClassroomCode[];
}

export async function markCodeUsed(code: string) {
  const { error } = await supabase
    .from('classroom_codes')
    .update({ used: true })
    .eq('code', code);
  if (error) throw error;
}

export async function listStudents(): Promise<StudentRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, created_at')
    .eq('role', 'student')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as StudentRow[];
}
