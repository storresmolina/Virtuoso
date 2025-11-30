import { supabase } from '../lib/supabase';

export type ClassroomCode = {
  id: string;
  code: string;
  used: boolean;
  classroom_id: string | null;
  created_at: string;
};

export type StudentRow = {
  id: string;
  email: string | null;
  name: string | null;
  created_at: string;
};

export type Classroom = {
  id: string;
  name: string;
  instructor_id: string;
  created_at: string;
  member_count?: number;
};

export type MembershipTier = {
  id: string;
  name: string;
  max_students: number | null;
  ai_analysis_enabled: boolean;
  price_monthly: number;
};

// Classrooms
export async function createClassroom(instructorId: string, name: string): Promise<Classroom> {
  const { data, error } = await supabase
    .from('classrooms')
    .insert({ instructor_id: instructorId, name })
    .select()
    .single();
  if (error) throw error;
  return data as Classroom;
}

export async function listClassrooms(instructorId: string): Promise<Classroom[]> {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  
  // Count members for each classroom
  const classrooms = data ?? [];
  for (const c of classrooms) {
    const { count } = await supabase
      .from('classroom_members')
      .select('*', { count: 'exact', head: true })
      .eq('classroom_id', c.id);
    (c as any).member_count = count ?? 0;
  }
  return classrooms as Classroom[];
}

export async function getClassroomMembers(classroomId: string): Promise<StudentRow[]> {
  const { data, error } = await supabase
    .from('classroom_members')
    .select('user_id, profiles(id, email, name, created_at)')
    .eq('classroom_id', classroomId);
  if (error) throw error;
  return (data ?? []).map((m: any) => m.profiles) as StudentRow[];
}

// Codes
export async function createOneUseCode(classroomId: string): Promise<ClassroomCode> {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const { data, error } = await supabase
    .from('classroom_codes')
    .insert({ code, used: false, classroom_id: classroomId })
    .select()
    .single();
  if (error) throw error;
  return data as ClassroomCode;
}

export async function listCodes(classroomId?: string): Promise<ClassroomCode[]> {
  let query = supabase.from('classroom_codes').select('*').order('created_at', { ascending: false });
  if (classroomId) query = query.eq('classroom_id', classroomId);
  const { data, error } = await query;
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

// Membership
export async function joinClassroomByCode(userId: string, code: string): Promise<{ classroomId: string }> {
  // Find code and classroom
  const { data: codeData, error: codeErr } = await supabase
    .from('classroom_codes')
    .select('classroom_id, used')
    .eq('code', code)
    .single();
  if (codeErr || !codeData?.classroom_id) throw new Error('invalid_code');
  if (codeData.used) throw new Error('code_already_used');
  
  // Check tier limit
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('instructor_id')
    .eq('id', codeData.classroom_id)
    .single();
  if (!classroom) throw new Error('classroom_not_found');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('membership_tier')
    .eq('id', classroom.instructor_id)
    .single();
  
  const tier = profile?.membership_tier ?? 'free';
  const { data: tierData } = await supabase
    .from('membership_tiers')
    .select('max_students')
    .eq('id', tier)
    .single();
  
  if (tierData?.max_students !== null && tierData?.max_students !== undefined) {
    const { count } = await supabase
      .from('classroom_members')
      .select('*', { count: 'exact', head: true })
      .eq('classroom_id', codeData.classroom_id);
    if ((count ?? 0) >= tierData.max_students) {
      throw new Error('classroom_full');
    }
  }
  
  // Add member
  const { error: memberErr } = await supabase
    .from('classroom_members')
    .insert({ classroom_id: codeData.classroom_id, user_id: userId });
  if (memberErr) throw memberErr;
  
  // Mark code used
  await markCodeUsed(code);
  
  return { classroomId: codeData.classroom_id };
}

export async function getUserClassrooms(userId: string): Promise<Classroom[]> {
  const { data, error } = await supabase
    .from('classroom_members')
    .select('classroom_id, classrooms(id, name, instructor_id, created_at)')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((m: any) => m.classrooms) as Classroom[];
}

export async function getTier(userId: string): Promise<MembershipTier | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('membership_tier')
    .eq('id', userId)
    .single();
  if (!profile?.membership_tier) return null;
  
  const { data } = await supabase
    .from('membership_tiers')
    .select('*')
    .eq('id', profile.membership_tier)
    .single();
  return data as MembershipTier | null;
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
