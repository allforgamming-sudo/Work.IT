// Supabase Configuration
const SUPABASE_URL = 'https://hyvhhqidlyzvclczqlkk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ARg4r_4CtKwDX2jWQZqr0g_dJp1L42F';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('Supabase initialized');
