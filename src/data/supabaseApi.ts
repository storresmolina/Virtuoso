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
  max_size?: number | null;
  description?: string | null;
};

export type MembershipTier = {
  id: string;
  name: string;
  max_students: number | null;
  ai_analysis_enabled: boolean;
  price_monthly: number;
};

// Classrooms
export async function createClassroom(instructorId: string, name: string, maxSize?: number): Promise<Classroom> {
  const insertData: any = { instructor_id: instructorId, name };
  // Only include max_size if the column exists (after migration)
  if (maxSize !== undefined) {
    insertData.max_size = maxSize;
  }
  const { data, error } = await supabase
    .from('classrooms')
    .insert(insertData)
    .select()
    .single();
  if (error) throw error;
  return data as Classroom;
}

export async function updateClassroom(classroomId: string, fields: { name?: string; description?: string | null; max_size?: number | null }) {
  const update: any = {};
  if (fields.name !== undefined) update.name = fields.name;
  if (fields.description !== undefined) update.description = fields.description;
  if (fields.max_size !== undefined) update.max_size = fields.max_size;

  const { data, error } = await supabase
    .from('classrooms')
    .update(update)
    .eq('id', classroomId)
    .select()
    .single();
  if (error) throw error;
  return data as Classroom;
}

export async function deleteClassroom(classroomId: string) {
  const { error } = await supabase
    .from('classrooms')
    .delete()
    .eq('id', classroomId);
  if (error) throw error;
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
  
  // Get classroom details
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('instructor_id, max_size')
    .eq('id', codeData.classroom_id)
    .single();
  if (!classroom) throw new Error('classroom_not_found');
  
  // Check if classroom has its own max_size limit
  if (classroom.max_size !== null && classroom.max_size !== undefined) {
    const { count } = await supabase
      .from('classroom_members')
      .select('*', { count: 'exact', head: true })
      .eq('classroom_id', codeData.classroom_id);
    if ((count ?? 0) >= classroom.max_size) {
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

// Get all students for an instructor with their classroom info
export async function getInstructorStudents(instructorId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('classroom_members')
    .select(`
      user_id,
      classroom_id,
      created_at,
      classrooms!inner(id, name, max_size, instructor_id),
      profiles!inner(id, email, name, created_at)
    `)
    .eq('classrooms.instructor_id', instructorId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Transform the data to a cleaner format
  return (data ?? []).map((item: any) => ({
    id: item.profiles.id,
    email: item.profiles.email,
    name: item.profiles.name,
    joined_at: item.created_at,
    classroom_id: item.classrooms.id,
    classroom_name: item.classrooms.name,
    classroom_max_size: item.classrooms.max_size,
    // TODO: Add practice sessions count, last active, etc.
  }));
}

// Types for Schedule
export type ScheduleEntry = {
  id: string;
  classroom_id: string;
  instructor_id: string;
  date: string;
  topic: string;
  notes?: string;
  bullets?: string[];
  attached_documents?: string[]; // document IDs (hidden from students)
  attached_notebooks?: string[]; // notebook IDs (hidden from students)
  created_at: string;
  updated_at: string;
};

// Types for Notebooks
export type Notebook = {
  id: string;
  instructor_id: string;
  title: string;
  content?: string;
  class_name?: string;
  created_at: string;
  updated_at: string;
};

// Types for Documents
export type Document = {
  id: string;
  classroom_id: string;
  instructor_id: string;
  name: string; // filename
  title?: string; // editable display title
  type: string; // 'sheet_music', 'reference', 'assignment', etc
  file_url: string;
  file_size_mb?: number;
  upload_date: string;
  comments?: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

// Types for Practice Sessions
export type PracticeSession = {
  id: string;
  classroom_id: string;
  student_id: string;
  instructor_id: string;
  file_url: string;
  file_size_mb?: number;
  file_name: string;
  ai_breakdown?: string;
  ai_processing_status: 'pending' | 'ready' | 'failed';
  upload_date: string;
  created_at: string;
  updated_at: string;
};

export type PracticeComment = {
  id: string;
  practice_session_id: string;
  author_id: string;
  comment: string;
  timestamp: string;
  created_at: string;
};

// Schedule APIs
export async function createScheduleEntry(
  classroomId: string,
  instructorId: string,
  data: Omit<ScheduleEntry, 'id' | 'instructor_id' | 'classroom_id' | 'created_at' | 'updated_at'>
): Promise<ScheduleEntry> {
  const { data: result, error } = await supabase
    .from('schedule_entries')
    .insert({
      classroom_id: classroomId,
      instructor_id: instructorId,
      ...data
    })
    .select()
    .single();
  if (error) throw error;
  return result as ScheduleEntry;
}

export async function updateScheduleEntry(
  entryId: string,
  data: Partial<Omit<ScheduleEntry, 'id' | 'instructor_id' | 'classroom_id' | 'created_at' | 'updated_at'>>
): Promise<ScheduleEntry> {
  const { data: result, error } = await supabase
    .from('schedule_entries')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', entryId)
    .select()
    .single();
  if (error) throw error;
  return result as ScheduleEntry;
}

export async function deleteScheduleEntry(entryId: string): Promise<void> {
  const { error } = await supabase
    .from('schedule_entries')
    .delete()
    .eq('id', entryId);
  if (error) throw error;
}

export async function getClassroomSchedule(classroomId: string): Promise<ScheduleEntry[]> {
  const { data, error } = await supabase
    .from('schedule_entries')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ScheduleEntry[];
}

export async function getInstructorGlobalSchedule(instructorId: string): Promise<ScheduleEntry[]> {
  const { data, error } = await supabase
    .from('schedule_entries')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ScheduleEntry[];
}

// Notebook APIs
export async function createNotebook(
  instructorId: string,
  data: Omit<Notebook, 'id' | 'instructor_id' | 'created_at' | 'updated_at'>
): Promise<Notebook> {
  const { data: result, error } = await supabase
    .from('notebooks')
    .insert({
      instructor_id: instructorId,
      ...data
    })
    .select()
    .single();
  if (error) throw error;
  return result as Notebook;
}

export async function updateNotebook(
  notebookId: string,
  data: Partial<Omit<Notebook, 'id' | 'instructor_id' | 'created_at' | 'updated_at'>>
): Promise<Notebook> {
  const { data: result, error } = await supabase
    .from('notebooks')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', notebookId)
    .select()
    .single();
  if (error) throw error;
  return result as Notebook;
}

export async function deleteNotebook(notebookId: string): Promise<void> {
  const { error } = await supabase
    .from('notebooks')
    .delete()
    .eq('id', notebookId);
  if (error) throw error;
}

export async function getInstructorNotebooks(instructorId: string): Promise<Notebook[]> {
  const { data, error } = await supabase
    .from('notebooks')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Notebook[];
}

// Document APIs
export async function createDocument(
  classroomId: string,
  instructorId: string,
  data: Omit<Document, 'id' | 'classroom_id' | 'instructor_id' | 'created_at' | 'updated_at'>
): Promise<Document> {
  const { data: result, error } = await supabase
    .from('documents')
    .insert({
      classroom_id: classroomId,
      instructor_id: instructorId,
      ...data
    })
    .select()
    .single();
  if (error) throw error;
  return result as Document;
}

export async function updateDocument(
  documentId: string,
  data: Partial<Omit<Document, 'id' | 'classroom_id' | 'instructor_id' | 'created_at' | 'updated_at'>>
): Promise<Document> {
  const { data: result, error } = await supabase
    .from('documents')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', documentId)
    .select()
    .single();
  if (error) throw error;
  return result as Document;
}

export async function deleteDocument(documentId: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);
  if (error) throw error;
}

export async function getClassroomDocuments(classroomId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('upload_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Document[];
}

// Practice Session APIs
export async function createPracticeSession(
  classroomId: string,
  studentId: string,
  instructorId: string,
  data: Omit<PracticeSession, 'id' | 'classroom_id' | 'student_id' | 'instructor_id' | 'created_at' | 'updated_at'>
): Promise<PracticeSession> {
  const { data: result, error } = await supabase
    .from('practice_sessions')
    .insert({
      classroom_id: classroomId,
      student_id: studentId,
      instructor_id: instructorId,
      ...data
    })
    .select()
    .single();
  if (error) throw error;
  return result as PracticeSession;
}

export async function getPracticeSessions(classroomId: string, studentId?: string): Promise<PracticeSession[]> {
  let query = supabase
    .from('practice_sessions')
    .select('*')
    .eq('classroom_id', classroomId);
  
  if (studentId) {
    query = query.eq('student_id', studentId);
  }
  
  const { data, error } = await query.order('upload_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PracticeSession[];
}

export async function updatePracticeSessionAI(
  sessionId: string,
  aiBreakdown: string,
  status: 'ready' | 'failed' = 'ready'
): Promise<PracticeSession> {
  const { data: result, error } = await supabase
    .from('practice_sessions')
    .update({
      ai_breakdown: aiBreakdown,
      ai_processing_status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single();
  if (error) throw error;
  return result as PracticeSession;
}

// Practice Comment APIs
export async function addPracticeComment(
  practiceSessionId: string,
  authorId: string,
  comment: string
): Promise<PracticeComment> {
  const { data: result, error } = await supabase
    .from('practice_comments')
    .insert({
      practice_session_id: practiceSessionId,
      author_id: authorId,
      comment
    })
    .select()
    .single();
  if (error) throw error;
  return result as PracticeComment;
}

export async function getPracticeComments(practiceSessionId: string): Promise<PracticeComment[]> {
  const { data, error } = await supabase
    .from('practice_comments')
    .select('*')
    .eq('practice_session_id', practiceSessionId)
    .order('timestamp', { ascending: true });
  if (error) throw error;
  return (data ?? []) as PracticeComment[];
}

export async function deletePracticeComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('practice_comments')
    .delete()
    .eq('id', commentId);
  if (error) throw error;
}

// ============================================================================
// STORAGE APIs - File Upload & Download with Signed URLs (Secure)
// ============================================================================

/**
 * Upload a file to PRIVATE Storage
 * @param bucket - 'classroom-documents' or 'practice-sessions'
 * @param path - Path in storage, e.g., 'classroom-123/document.pdf'
 * @param file - File object to upload
 * @returns Path where file was stored
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ path: string }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: false,
      contentType: file.type
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return { path: data.path };
}

/**
 * Get a temporary signed URL for accessing a private file
 * Signed URLs expire after specified time (default 1 hour)
 * Use for downloads and streaming
 * @param bucket - 'classroom-documents' or 'practice-sessions'
 * @param path - Path to file in storage
 * @param expiresIn - Expiration time in seconds (default 3600 = 1 hour)
 * @returns Temporary signed URL
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw new Error(`Failed to generate signed URL: ${error.message}`);
  return data.signedUrl;
}

/**
 * Delete a file from Storage
 * @param bucket - 'classroom-documents' or 'practice-sessions'
 * @param path - Path to file in storage
 */
export async function deleteStorageFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

/**
 * Download a file blob directly (for small files)
 * For large files, use getSignedUrl and download via browser
 * @param bucket - 'classroom-documents' or 'practice-sessions'
 * @param path - Path to file in storage
 * @returns File blob
 */
export async function downloadFileBlob(bucket: string, path: string): Promise<Blob> {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw new Error(`Download failed: ${error.message}`);
  return data;
}
