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

// Create Supabase client with optimized settings for better connection handling
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

// Enhanced connection test with detailed logging and retry logic
export const testConnection = async (retries: number = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Testing Supabase connection (attempt ${attempt}/${retries})...`)
      
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
        console.error(`❌ Supabase connection test failed (attempt ${attempt}):`, error)
        if (attempt === retries) {
          return false
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        continue
      }
      
      console.log('✅ Supabase connection successful')
      return true
    } catch (err: any) {
      console.error(`❌ Supabase connection error (attempt ${attempt}):`, err)
      if (attempt === retries) {
        return false
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
  return false
}

// Helper function to create queries with timeout and better error handling
export const createTimeoutQuery = <T>(
  queryPromise: Promise<T> | any, 
  timeoutMs: number = 10000, // Reduced from 15000 to 10000
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

// Helper function for retrying failed queries
export const retryQuery = async <T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await queryFn()
    } catch (error: any) {
      lastError = error
      console.warn(`Query attempt ${attempt} failed:`, error.message)
      
      if (attempt <= maxRetries) {
        console.log(`Retrying in ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
        delayMs *= 1.5 // Exponential backoff
      }
    }
  }
  
  throw lastError
}

// Optimized function to get user profile with better error handling
export const getUserProfile = async (userId: string) => {
  if (!userId || !isSupabaseConfigured) {
    return {
      data: null,
      error: new Error('Missing user ID or Supabase not configured')
    }
  }

  try {
    console.log('🔍 Fetching optimized user profile for:', userId)

    // Use a single query to get both profile and XP data with a join
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        xp:xp(*)
      `)
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('❌ Error in getUserProfile:', error)
      return { data: null, error }
    }

    // If no profile exists, return null
    if (!data) {
      console.log('ℹ️ No user profile found for:', userId)
      return { data: null, error: null }
    }

    // Extract XP data from the joined result
    const xpData = data.xp && data.xp.length > 0 ? data.xp[0] : null

    // Return structured data
    const profileData = {
      profile: {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        created_at: data.created_at
      },
      xp: xpData || {
        id: 'default',
        user_id: userId,
        points: 0,
        badges: []
      }
    }

    console.log('✅ User profile fetched successfully')
    return { data: profileData, error: null }

  } catch (error: any) {
    console.error('❌ Exception in getUserProfile:', error)
    return { 
      data: null, 
      error: new Error(`Failed to fetch user profile: ${error.message}`)
    }
  }
}

// New optimized function to ensure user profile exists with fallback handling
export const ensureUserProfile = async (user: any) => {
  if (!user?.id || !isSupabaseConfigured) {
    return {
      data: {
        profile: {
          id: user?.id || 'fallback',
          email: user?.email || null,
          full_name: user?.user_metadata?.full_name || 'User',
          created_at: new Date().toISOString()
        },
        xp: {
          id: 'fallback',
          user_id: user?.id || 'fallback',
          points: 100,
          badges: ['Welcome']
        }
      },
      error: { fallback: true, message: 'Using fallback profile - Supabase not configured' }
    }
  }

  try {
    console.log('🔍 Ensuring user profile exists for:', user.id)

    // First, try to get existing profile and XP in a single query
    const { data: existingData, error: fetchError } = await supabase
      .from('users')
      .select(`
        *,
        xp:xp(*)
      `)
      .eq('id', user.id)
      .maybeSingle()

    if (fetchError) {
      console.error('❌ Error fetching existing profile:', fetchError)
      // Return fallback data
      return {
        data: {
          profile: {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'User',
            created_at: new Date().toISOString()
          },
          xp: {
            id: 'fallback',
            user_id: user.id,
            points: 100,
            badges: ['Welcome']
          }
        },
        error: { fallback: true, message: 'Database error, using fallback profile' }
      }
    }

    // If profile exists, return it
    if (existingData) {
      const xpData = existingData.xp && existingData.xp.length > 0 ? existingData.xp[0] : null
      
      // If profile exists but no XP, create XP record
      if (!xpData) {
        try {
          const { data: newXP, error: xpError } = await supabase
            .from('xp')
            .insert({
              user_id: user.id,
              points: 100,
              badges: ['Welcome']
            })
            .select()
            .maybeSingle()

          if (xpError) {
            console.warn('Could not create XP record, using fallback')
          }

          return {
            data: {
              profile: {
                id: existingData.id,
                email: existingData.email,
                full_name: existingData.full_name,
                created_at: existingData.created_at
              },
              xp: newXP || {
                id: 'fallback',
                user_id: user.id,
                points: 100,
                badges: ['Welcome']
              }
            },
            error: null
          }
        } catch (error) {
          console.warn('XP creation failed, using fallback')
          return {
            data: {
              profile: {
                id: existingData.id,
                email: existingData.email,
                full_name: existingData.full_name,
                created_at: existingData.created_at
              },
              xp: {
                id: 'fallback',
                user_id: user.id,
                points: 100,
                badges: ['Welcome']
              }
            },
            error: { fallback: true, message: 'XP creation failed, using fallback' }
          }
        }
      }

      return {
        data: {
          profile: {
            id: existingData.id,
            email: existingData.email,
            full_name: existingData.full_name,
            created_at: existingData.created_at
          },
          xp: xpData
        },
        error: null
      }
    }

    // Profile doesn't exist, create it
    console.log('➕ Creating new user profile for:', user.id)
    
    try {
      // Create profile
      const { data: newProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
        })
        .select()
        .maybeSingle()

      if (profileError) {
        console.error('Profile creation failed:', profileError)
        throw profileError
      }

      // Create XP record
      const { data: newXP, error: xpError } = await supabase
        .from('xp')
        .insert({
          user_id: user.id,
          points: 100,
          badges: ['Welcome']
        })
        .select()
        .maybeSingle()

      if (xpError) {
        console.warn('XP creation failed, using fallback XP')
      }

      return {
        data: {
          profile: newProfile,
          xp: newXP || {
            id: 'fallback',
            user_id: user.id,
            points: 100,
            badges: ['Welcome']
          }
        },
        error: xpError ? { fallback: true, message: 'XP creation failed, using fallback' } : null
      }

    } catch (error: any) {
      console.error('❌ Error creating user profile:', error)
      
      // Return fallback data
      return {
        data: {
          profile: {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'User',
            created_at: new Date().toISOString()
          },
          xp: {
            id: 'fallback',
            user_id: user.id,
            points: 100,
            badges: ['Welcome']
          }
        },
        error: { fallback: true, message: 'Profile creation failed, using fallback' }
      }
    }

  } catch (error: any) {
    console.error('❌ Exception in ensureUserProfile:', error)
    
    // Return fallback data
    return {
      data: {
        profile: {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'User',
          created_at: new Date().toISOString()
        },
        xp: {
          id: 'fallback',
          user_id: user.id,
          points: 100,
          badges: ['Welcome']
        }
      },
      error: { fallback: true, message: 'Critical error, using fallback profile' }
    }
  }
}

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co'))

console.log('✅ Supabase configured:', isSupabaseConfigured)

// Auto-test connection on load with retry logic
if (isSupabaseConfigured) {
  testConnection(2).then(success => {
    if (success) {
      console.log('🎉 Initial connection test passed')
    } else {
      console.warn('⚠️ Initial connection test failed - check your Supabase setup')
    }
  })
} else {
  console.warn('⚠️ Supabase not properly configured')
}