import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkProjectSchema() {
  console.log('🔍 Checking projects table schema...')
  
  try {
    // Try to insert a minimal project to see what fails
    const { data, error } = await supabase
      .from('projects')
      .insert({
        client_id: 'ff307657-0d27-42fe-8a17-846498fa6496', // Use our test user
        title: 'Test Project',
        description: 'Test description'
      })
      .select()
      .single()
    
    if (error) {
      console.log('❌ Projects insert error:', error)
    } else {
      console.log('✅ Projects insert successful, columns:', Object.keys(data))
      
      // Clean up
      await supabase.from('projects').delete().eq('id', data.id)
    }

  } catch (error) {
    console.error('💥 Check failed:', error)
  }
}

checkProjectSchema()