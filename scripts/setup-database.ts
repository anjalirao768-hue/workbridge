// Script to set up database schema and seed data
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up WorkBridge database...')
    
    // Read and execute schema migration
    const schemaPath = path.join(process.cwd(), 'supabase/migrations/001_create_initial_schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📋 Creating database schema...')
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schemaSQL })
    
    if (schemaError) {
      console.error('❌ Schema creation failed:', schemaError)
      return
    }
    
    console.log('✅ Database schema created successfully!')
    
    // Read and execute seed data
    const seedPath = path.join(process.cwd(), 'supabase/seed.sql')
    const seedSQL = fs.readFileSync(seedPath, 'utf8')
    
    console.log('🌱 Seeding database with demo data...')
    const { error: seedError } = await supabase.rpc('exec_sql', { sql: seedSQL })
    
    if (seedError) {
      console.error('❌ Seeding failed:', seedError)
      return
    }
    
    console.log('✅ Database seeded successfully!')
    console.log('\n🎉 WorkBridge database setup complete!')
    console.log('\nDemo accounts created:')
    console.log('👤 Admin: admin@workbridge.com / password123')
    console.log('🏢 Client: client1@example.com / password123')
    console.log('💻 Freelancer: freelancer1@example.com / password123')
    
  } catch (error) {
    console.error('💥 Setup failed:', error)
  }
}

// Alternative: Execute SQL directly if rpc doesn't work
async function executeSQLDirect(sql: string) {
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)
  
  for (const statement of statements) {
    try {
      const { error } = await supabase.from('_temp').select('*').limit(0) // This will fail but allows us to execute raw SQL via error handling
      // Since we can't execute raw SQL directly, we'll use the REST API approach
    } catch (e) {
      // Handle individual statement execution
    }
  }
}

setupDatabase()