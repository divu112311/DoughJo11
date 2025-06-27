import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Supabase Configuration Check:')
console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseAnonKey)
console.log('Key length:', supabaseAnonKey?.length || 0)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('❌ Invalid Supabase URL format:', supabaseUrl)
  throw new Error('Invalid Supabase URL format. Should be: https://your-project-ref.supabase.co')
}

// Create Supabase client with optimized settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'doughjo-web-app'
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

// Enhanced connection test with detailed logging
export const testConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...')
    console.log('URL:', supabaseUrl)
    
    // First, test a simple query
    const startTime = Date.now()
    const { data, error, status, statusText } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    const duration = Date.now() - startTime
    
    console.log('📊 Connection test results:')
    console.log('- Duration:', duration + 'ms')
    console.log('- Status:', status)
    console.log('- Status Text:', statusText)
    console.log('- Error:', error)
    console.log('- Data:', data)
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error)
      
      // Provide specific error guidance
      if (error.message.includes('JWT')) {
        console.error('🔑 JWT Error - Check your anon key')
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('🗄️ Table does not exist - Check your database schema')
      } else if (error.message.includes('timeout')) {
        console.error('⏰ Connection timeout - Check your internet connection')
      } else if (error.message.includes('CORS')) {
        console.error('🌐 CORS error - Check your domain configuration')
      }
      
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (err: any) {
    console.error('❌ Supabase connection error:', err)
    
    // Additional error context
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      console.error('🌐 Network error - Check your internet connection')
    } else if (err.message.includes('Invalid URL')) {
      console.error('🔗 Invalid URL - Check your VITE_SUPABASE_URL')
    }
    
    return false
  }
}

// Helper function to create queries with timeout and better error handling
export const createTimeoutQuery = <T>(
  queryPromise: Promise<T>, 
  timeoutMs: number = 30000, // Increased to 30 seconds
  errorMessage: string = 'Query timeout'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => {
      console.error(`⏰ Query timeout after ${timeoutMs}ms:`, errorMessage)
      reject(new Error(`${errorMessage} (${timeoutMs}ms)`))
    }, timeoutMs)
    
    // Clear timeout if query completes
    queryPromise.finally(() => clearTimeout(timeoutId))
  })
  
  return Promise.race([queryPromise, timeoutPromise])
}

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co'))

console.log('✅ Supabase configured:', isSupabaseConfigured)

// Auto-test connection on load
if (isSupabaseConfigured) {
  testConnection().then(success => {
    if (success) {
      console.log('🎉 Initial connection test passed')
    } else {
      console.warn('⚠️ Initial connection test failed - check your Supabase setup')
    }
  })
} else {
  console.warn('⚠️ Supabase not properly configured')
}