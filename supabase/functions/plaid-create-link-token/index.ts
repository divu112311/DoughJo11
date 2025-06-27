import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()
    
    if (!userId) {
      throw new Error('Missing userId parameter')
    }

    const plaidClientId = Deno.env.get('PLAID_CLIENT_ID')
    const plaidSecret = Deno.env.get('PLAID_SECRET')
    const plaidEnv = Deno.env.get('PLAID_ENV') || 'sandbox'

    if (!plaidClientId || !plaidSecret) {
      throw new Error('Plaid credentials not configured')
    }

    const plaidBaseUrl = plaidEnv === 'sandbox' 
      ? 'https://sandbox.plaid.com'
      : plaidEnv === 'development'
      ? 'https://development.plaid.com'
      : 'https://production.plaid.com'

    // Create link token request
    const linkTokenRequest = {
      user: {
        client_user_id: userId,
      },
      client_name: 'DoughJo Financial App',
      products: ['accounts', 'transactions'],
      country_codes: ['US'],
      language: 'en',
      webhook: `${Deno.env.get('SUPABASE_URL')}/functions/v1/plaid-webhook`,
    }

    console.log('Creating Plaid link token for user:', userId)

    const response = await fetch(`${plaidBaseUrl}/link/token/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': plaidClientId,
        'PLAID-SECRET': plaidSecret,
      },
      body: JSON.stringify(linkTokenRequest),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Plaid API error:', response.status, errorData)
      throw new Error(`Plaid API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log('Link token created successfully')

    return new Response(
      JSON.stringify({ link_token: data.link_token }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error creating link token:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to create Plaid link token'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})