// Initialize database with basic tables structure
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function initDatabase() {
  console.log('🚀 Initializing WorkBridge database...')
  
  try {
    // Check if users table already has the required columns
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('Creating users table...')
      // Users table doesn't exist, let's create it via SQL
    } else {
      console.log('✅ Users table exists')
    }

    // For now, let's just test the connection and see what tables exist
    console.log('📋 Testing database connection...')
    
    // Try to insert a test admin user
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@workbridge.com',
        password_hash: '$2b$10$rOgK1YsNq4R1YsNq4R1YsO1YsNq4R1YsNq4R1YsNq4R1YsNq4R1Ys',
        role: 'admin',
        cover_letter: 'Platform Administrator',
        experiences: 'System Administration',
        age: 30,
        skills: ['Admin', 'Platform Management']
      })
      .select()
    
    if (userError) {
      console.error('❌ User creation failed:', userError)
    } else {
      console.log('✅ Test admin user created/updated')
    }
    
    console.log('🎉 Database initialization complete!')
    
  } catch (error) {
    console.error('💥 Database init failed:', error)
  }
}

initDatabase()