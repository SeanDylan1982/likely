import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyzcompanyname.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);