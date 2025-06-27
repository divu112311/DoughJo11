import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client with optimized settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
})

// Helper function to create queries with timeout
export const createTimeoutQuery = <T>(
  queryPromise: Promise<T>, 
  timeoutMs: number = 5000,
  errorMessage: string = 'Query timeout'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  )
  
  return Promise.race([queryPromise, timeoutPromise])
}

// Test connection function
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    
    const testQuery = supabase
      .from('users')
      .select('count')
      .limit(1)
    
    const { data, error } = await createTimeoutQuery(
      testQuery,
      3000,
      'Connection test timeout'
    )
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    
    console.log('Supabase connection successful')
    return true
  } catch (err) {
    console.error('Supabase connection error:', err)
    return false
  }
}

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co'))