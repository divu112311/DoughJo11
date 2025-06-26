# Plaid Integration Setup Guide

DoughJo now includes full Plaid integration for secure bank account connectivity! Here's how to set it up:

## Step 1: Create Plaid Account

1. Go to [Plaid Dashboard](https://dashboard.plaid.com/signup)
2. Sign up for a free developer account
3. Complete the verification process

## Step 2: Get Your API Keys

1. In the Plaid Dashboard, go to **Team Settings** → **Keys**
2. Copy your:
   - **Client ID**
   - **Secret Key** (for Sandbox environment)
   - **Public Key** (if using Link v1, not needed for v2)

## Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
# Plaid Configuration
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET=your_sandbox_secret_here
PLAID_ENV=sandbox

# For production later:
PLAID_WEBHOOK_URL=https://your-project.supabase.co/functions/v1/plaid-webhook
```

## Step 4: Set Up Supabase Secrets

Add your Plaid credentials to Supabase:

### Via Supabase Dashboard:
1. Go to **Settings** → **Secrets**
2. Add these secrets:
   - `PLAID_CLIENT_ID`: Your Plaid client ID
   - `PLAID_SECRET`: Your Plaid secret key
   - `PLAID_ENV`: `sandbox` (for development)

### Via CLI:
```bash
supabase secrets set PLAID_CLIENT_ID=your_client_id_here
supabase secrets set PLAID_SECRET=your_sandbox_secret_here
supabase secrets set PLAID_ENV=sandbox
```

## Step 5: Deploy Database Migration

The bank accounts table has been created. Make sure it's deployed:

```bash
# If using CLI locally
supabase db push

# Or apply the migration manually in your Supabase SQL editor
```

## Step 6: Deploy Edge Functions

Deploy the Plaid webhook handler:

```bash
supabase functions deploy plaid-webhook
```

## Step 7: Create Backend API Routes

You'll need to create these API endpoints in your backend:

### `/api/plaid/create-link-token` (POST)
```javascript
// Creates a link token for Plaid Link initialization
const response = await plaidClient.linkTokenCreate({
  user: { client_user_id: userId },
  client_name: 'DoughJo',
  products: ['transactions', 'accounts'],
  country_codes: ['US'],
  language: 'en',
});
```

### `/api/plaid/exchange-token` (POST)
```javascript
// Exchanges public token for access token and saves accounts
const response = await plaidClient.itemPublicTokenExchange({
  public_token: publicToken,
});
// Save access_token and account data to Supabase
```

### `/api/plaid/refresh-accounts` (POST)
```javascript
// Refreshes account balances
const accounts = await plaidClient.accountsGet({
  access_token: accessToken,
});
// Update balances in Supabase
```

## Step 8: Test the Integration

1. Start your development server
2. Go to the Dashboard
3. Click "Add Account" in the Bank Accounts section
4. You'll see Plaid Link open with sandbox banks
5. Use these test credentials:
   - **Username**: `user_good`
   - **Password**: `pass_good`

## Plaid Environments

### Sandbox (Development)
- Free testing environment
- Fake banks and accounts
- Perfect for development and testing

### Development (Testing)
- Real bank connections
- Limited to 100 Items
- Good for pre-production testing

### Production (Live)
- Real bank connections
- Requires Plaid approval
- Pay per API call

## Features Included

✅ **Secure Bank Connection**: Industry-standard OAuth flow  
✅ **Account Management**: View all connected accounts  
✅ **Balance Tracking**: Real-time balance updates  
✅ **Multiple Banks**: Connect accounts from different institutions  
✅ **Account Types**: Checking, savings, credit cards, investments  
✅ **Security**: Bank-level encryption and read-only access  
✅ **Webhooks**: Automatic updates when data changes  

## Security Features

🔒 **Bank-Level Security**: 256-bit encryption  
🔒 **Read-Only Access**: Cannot initiate transactions  
🔒 **Token Management**: Secure token storage and rotation  
🔒 **RLS Policies**: Users can only access their own accounts  
🔒 **Webhook Verification**: Secure webhook handling  

## Troubleshooting

### "Link token creation failed"
- Check your Plaid credentials in Supabase secrets
- Verify your client ID and secret key are correct
- Make sure you're using the right environment (sandbox/development/production)

### "Public token exchange failed"
- Ensure your backend API endpoints are working
- Check that the database migration was applied
- Verify Supabase RLS policies are set up correctly

### "Account data not updating"
- Check webhook configuration
- Verify the plaid-webhook Edge Function is deployed
- Look at Edge Function logs for errors

## Going to Production

1. **Get Production Approval**: Apply for production access in Plaid Dashboard
2. **Update Environment**: Change `PLAID_ENV` to `production`
3. **Use Production Keys**: Replace sandbox keys with production keys
4. **Set Webhook URL**: Configure webhook URL in Plaid Dashboard
5. **Test Thoroughly**: Test with real bank accounts in development environment first

## Cost Considerations

- **Sandbox**: Free
- **Development**: Free (up to 100 Items)
- **Production**: Pay per API call
  - Account data: ~$0.50 per account per month
  - Transactions: ~$0.10 per account per month
  - Identity verification: ~$0.25 per verification

Your DoughJo app now has enterprise-grade banking integration! 🏦🥋