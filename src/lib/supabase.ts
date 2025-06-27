import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Supabase Configuration Check:')
console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables - using fallback mode')
}

// Validate URL format if provided
if (supabaseUrl && (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co'))) {
  console.warn('⚠️ Invalid Supabase URL format - using fallback mode')
}

// Use fallback values if not configured
const finalUrl = (supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')) 
  ? supabaseUrl 
  : 'https://placeholder.supabase.co'

const finalKey = (supabaseAnonKey && supabaseAnonKey.length > 20) 
  ? supabaseAnonKey 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

// Create Supabase client with optimized settings
export const supabase = createClient(finalUrl, finalKey, {
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
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (err: any) {
    console.error('❌ Supabase connection error:', err)
    return false
  }
}

// Helper function to create queries with timeout and better error handling
export const createTimeoutQuery = <T>(
  queryPromise: Promise<T> | any, 
  timeoutMs: number = 15000,
  errorMessage: string = 'Query timeout'
): Promise<T> => {
  // Convert Supabase query builder to native Promise
  const nativePromise = Promise.resolve(queryPromise)
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => {
      console.error(`⏰ Query timeout after ${timeoutMs}ms:`, errorMessage)
      reject(new Error(`${errorMessage} (${timeoutMs}ms)`))
    }, timeoutMs)
    
    // Clear timeout if query completes
    nativePromise.finally(() => clearTimeout(timeoutId))
  })
  
  return Promise.race([nativePromise, timeoutPromise])
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