import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema:
/*
Table: favorites
  - id: uuid (primary key)
  - user_id: uuid (foreign key to auth.users.id)
  - content_id: integer
  - content_type: text
  - created_at: timestamp with time zone

Policies:
  - Enable read access for users to their own favorites
  - Enable insert for authenticated users (their own favorites)
  - Enable delete for users on their own favorites
*/