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

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Fetching user accounts from database...')

    // Get user's bank accounts from database
    const { data: userAccounts, error: fetchError } = await supabaseClient
      .from('bank_accounts')
      .select('*')
      .eq('user_id', userId)

    if (fetchError) {
      throw new Error(`Failed to fetch user accounts: ${fetchError.message}`)
    }

    if (!userAccounts || userAccounts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No accounts found to refresh' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    console.log('Refreshing', userAccounts.length, 'accounts...')

    // Group accounts by access token to minimize API calls
    const tokenGroups = userAccounts.reduce((groups: any, account: any) => {
      const token = account.plaid_access_token
      if (!groups[token]) {
        groups[token] = []
      }
      groups[token].push(account)
      return groups
    }, {})

    const updatedAccounts = []

    // Refresh each group of accounts
    for (const [accessToken, accounts] of Object.entries(tokenGroups)) {
      try {
        console.log('Refreshing accounts for token group...')

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
          console.error('Failed to refresh accounts for token:', accessToken)
          continue
        }

        const accountsData = await accountsResponse.json()

        // Update each account's balance
        for (const plaidAccount of accountsData.accounts) {
          const dbAccount = (accounts as any[]).find(
            acc => acc.plaid_account_id === plaidAccount.account_id
          )

          if (dbAccount) {
            const newBalance = plaidAccount.balances.current || 0
            
            const { data: updatedAccount, error: updateError } = await supabaseClient
              .from('bank_accounts')
              .update({
                balance: newBalance,
                last_updated: new Date().toISOString(),
              })
              .eq('id', dbAccount.id)
              .select()
              .single()

            if (!updateError && updatedAccount) {
              updatedAccounts.push(updatedAccount)
            }
          }
        }
      } catch (error) {
        console.error('Error refreshing token group:', error)
        continue
      }
    }

    console.log('Successfully refreshed', updatedAccounts.length, 'accounts')

    return new Response(
      JSON.stringify({ 
        success: true, 
        refreshedAccounts: updatedAccounts.length,
        message: `Successfully refreshed ${updatedAccounts.length} accounts`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error refreshing accounts:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to refresh account balances'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})