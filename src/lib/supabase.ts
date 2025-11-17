import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mangdjdvtsjovgmclneg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hbmdkamR2dHNqb3ZnbWNsbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMzA1NTEsImV4cCI6MjA3ODcwNjU1MX0.Kxx0fMR89mNFUjGwu2btRa8aDkP7yS1Xj9OPJFQAuxk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
