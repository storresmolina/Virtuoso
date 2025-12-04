import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dlvkjoyubvjbigpffzrn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdmtqb3l1YnZqYmlncGZmenJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTQyOTAsImV4cCI6MjA3OTk3MDI5MH0._daFlfC7Bj5Q9FNlwUd3kCvT9eoD2kQLP0r1APb4NzA';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Using fallback credentials. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
