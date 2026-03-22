import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Verifying Supabase connection and tables...\n');

// Test tables
const tablesToCheck = [
  'student_profile', 'academic_info', 'notices', 'timetable', 
  'calendar_events', 'attendance_by_subject', 'semester_marks',
  'fee_structure', 'issued_books', 'canteen_menu', 'feedback_subjects'
];

let successCount = 0;
let failureCount = 0;

for (const table of tablesToCheck) {
  try {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
      failureCount++;
    } else {
      console.log(`✅ ${table}: ${count} rows`);
      successCount++;
    }
  } catch (e) {
    console.log(`❌ ${table}: ${e.message}`);
    failureCount++;
  }
}

console.log(`\n📊 Summary: ${successCount}/${tablesToCheck.length} tables verified`);
if (failureCount === 0) {
  console.log('✅ All systems go! Ready to test the app.');
  process.exit(0);
} else {
  console.log(`⚠️  ${failureCount} table(s) failed. Check Supabase.`);
  process.exit(1);
}
