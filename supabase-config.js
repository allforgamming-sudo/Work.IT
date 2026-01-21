// Supabase Configuration
const SUPABASE_URL = 'https://hyvhhqidlyzvclczqlkk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5dmhocWlkbHl6dmNsY3pxbGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NTc1ODksImV4cCI6MjA4NDMzMzU4OX0.MyfN1XzIttfIyWNTnPAWyksJ5QtWv9chuXdb7qg6vAQ';

// Initialize Supabase client
var supabase;
try {
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase initialized successfully');
    } else {
        console.error('❌ Supabase library not loaded');
    }
} catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
}
