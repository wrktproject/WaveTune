import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing!');
  console.error('Current URL:', supabaseUrl || 'undefined');
  console.error('Current Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined');
  console.error('Environment:', import.meta.env.MODE);
  console.error('All env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
