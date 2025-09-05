const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
const supabaseUrl = 'https://bufgalmkwblyqkkpcgxh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZmdhbG1rd2JseXFra3BjZ3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYxMjQ1NiwiZXhwIjoyMDcxMTg4NDU2fQ.ogTQDYlyYss7l1pMlsdIoNh4PDwGISNxjb2HZddzPJs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running OTP migration...');
  
  try {
    // Add email_verified column to users table
    console.log('📋 Adding email_verified column to users table...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;'
    });
    
    if (alterError) {
      console.log('Note: ALTER TABLE might have failed, but column might already exist');
      console.log('Error:', alterError.message);
    } else {
      console.log('✅ email_verified column added');
    }
    
    // Create otp_codes table
    console.log('📋 Creating otp_codes table...');
    const otpTableSQL = `
      CREATE TABLE IF NOT EXISTS otp_codes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        otp TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: otpTableSQL
    });
    
    if (tableError) {
      console.log('Note: CREATE TABLE might have failed, but table might already exist');
      console.log('Error:', tableError.message);
    } else {
      console.log('✅ otp_codes table created');
    }
    
    // Create indexes
    console.log('📋 Creating indexes...');
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
      CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
    `;
    
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: indexSQL
    });
    
    if (indexError) {
      console.log('Note: INDEX creation might have failed, but indexes might already exist');
      console.log('Error:', indexError.message);
    } else {
      console.log('✅ Indexes created');
    }
    
    // Test the tables
    console.log('🔍 Testing tables...');
    
    const { data: otpTest, error: otpTestError } = await supabase
      .from('otp_codes')
      .select('*')
      .limit(1);
      
    if (otpTestError) {
      console.log('❌ otp_codes table test failed:', otpTestError.message);
    } else {
      console.log('✅ otp_codes table is accessible');
    }
    
    const { data: usersTest, error: usersTestError } = await supabase
      .from('users')
      .select('id,email,email_verified')
      .limit(1);
      
    if (usersTestError) {
      console.log('❌ users table test failed:', usersTestError.message);
    } else {
      console.log('✅ users table with email_verified is accessible');
    }
    
    console.log('\n🎉 Migration completed!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

runMigration();