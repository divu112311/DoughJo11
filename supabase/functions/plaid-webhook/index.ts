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
    const { webhook_type, webhook_code, item_id, error, accounts } = await req.json()
    
    console.log('Plaid webhook received:', { webhook_type, webhook_code, item_id })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Handle different webhook types
    switch (webhook_type) {
      case 'TRANSACTIONS':
        if (webhook_code === 'DEFAULT_UPDATE') {
          console.log('New transactions available for item:', item_id)
          // Here you would typically fetch new transactions and update the database
          // For now, we'll just log it
        }
        break

      case 'ACCOUNTS':
        if (webhook_code === 'DEFAULT_UPDATE') {
          console.log('Account data updated for item:', item_id)
          // Update account balances in database
          if (accounts && accounts.length > 0) {
            for (const account of accounts) {
              await supabaseClient
                .from('bank_accounts')
                .update({
                  balance: account.balances.current,
                  last_updated: new Date().toISOString()
                })
                .eq('plaid_account_id', account.account_id)
            }
          }
        }
        break

      case 'ITEM':
        if (webhook_code === 'ERROR') {
          console.error('Item error:', error)
          // Handle item errors (e.g., expired credentials)
        }
        break

      default:
        console.log('Unhandled webhook type:', webhook_type)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})