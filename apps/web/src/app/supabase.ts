import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';
import { environment } from '../environments/environment';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  environment.supabaseUrl,
  environment.supabaseKey
);
