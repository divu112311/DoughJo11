import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { publicToken, userId, institutionName, accounts } = await req.json()
    
    if (!publicToken || !userId) {
      throw new Error('Missing required parameters: publicToken and userId')
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

    console.log('Exchanging public token for access token...')

    // Exchange public token for access token
    const tokenResponse = await fetch(`${plaidBaseUrl}/item/public_token/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': plaidClientId,
        'PLAID-SECRET': plaidSecret,
      },
      body: JSON.stringify({
        public_token: publicToken,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange error:', tokenResponse.status, errorData)
      throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    const itemId = tokenData.item_id

    console.log('Access token obtained, fetching account details...')

    // Get account information
    const accountsResponse = await fetch(`${plaidBaseUrl}/accounts/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': plaidClientId,
        'PLAID-SECRET': plaidSecret,
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    })

    if (!accountsResponse.ok) {
      const errorData = await accountsResponse.text()
      console.error('Accounts fetch error:', accountsResponse.status, errorData)
      throw new Error(`Failed to fetch accounts: ${accountsResponse.status}`)
    }

    const accountsData = await accountsResponse.json()
    console.log('Account data fetched:', accountsData.accounts.length, 'accounts')

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Prepare account data for database
    const accountsToInsert = accountsData.accounts.map((account: any) => ({
      user_id: userId,
      plaid_account_id: account.account_id,
      plaid_access_token: accessToken,
      name: account.name,
      type: account.type,
      subtype: account.subtype || null,
      balance: account.balances.current || 0,
      institution_name: institutionName || 'Unknown Bank',
      institution_id: accountsData.item.institution_id || 'unknown',
      mask: account.mask || '0000',
      last_updated: new Date().toISOString(),
    }))

    console.log('Inserting accounts into database...')

    // Insert accounts into database
    const { data: insertedAccounts, error: insertError } = await supabaseClient
      .from('bank_accounts')
      .insert(accountsToInsert)
      .select()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw new Error(`Failed to save accounts: ${insertError.message}`)
    }

    console.log('Successfully saved', insertedAccounts.length, 'accounts')

    return new Response(
      JSON.stringify({ 
        success: true, 
        accounts: insertedAccounts,
        message: `Successfully connected ${insertedAccounts.length} accounts`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in token exchange:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to exchange token and save accounts'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})