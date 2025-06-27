# 🔧 Plaid Sandbox Deployment Guide

Since you have registered for Plaid sandbox, here's how to get it working:

## Step 1: Get Your Plaid Credentials

From your Plaid Dashboard at [dashboard.plaid.com](https://dashboard.plaid.com):

1. **Client ID**: Found in Team Settings → Keys
2. **Sandbox Secret**: Found in Team Settings → Keys  
3. **Environment**: Set to `sandbox`

## Step 2: Add Credentials to Supabase

### Via Supabase Dashboard (Recommended):
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Secrets**
3. Add these three secrets:

```
PLAID_CLIENT_ID = your_actual_client_id_here
PLAID_SECRET = your_actual_sandbox_secret_here  
PLAID_ENV = sandbox
```

**Important**: Make sure the secret names are exactly as shown above.

## Step 3: Deploy Edge Functions Manually

Since you're in a browser environment, you need to deploy via the Supabase Dashboard:

### Deploy plaid-create-link-token:
1. Go to **Edge Functions** in Supabase dashboard
2. Click **"Create Function"** 
3. Name: `plaid-create-link-token`
4. Copy the entire code from `supabase/functions/plaid-create-link-token/index.ts`
5. Paste into the editor
6. Click **"Deploy Function"**

### Deploy plaid-exchange-token:
1. Click **"Create Function"**
2. Name: `plaid-exchange-token` 
3. Copy code from `supabase/functions/plaid-exchange-token/index.ts`
4. Paste and deploy

### Deploy plaid-refresh-accounts:
1. Click **"Create Function"**
2. Name: `plaid-refresh-accounts`
3. Copy code from `supabase/functions/plaid-refresh-accounts/index.ts` 
4. Paste and deploy

## Step 4: Test the Integration

After deployment:

1. Go to your app → Dashboard → Bank Accounts
2. Click "Add Account"
3. Select "Real Plaid Sandbox" 
4. Click "Connect via Plaid Sandbox"
5. You should see Plaid Link open with test banks

### Test Credentials:
- **Institution**: First Platypus Bank
- **Username**: `user_good`
- **Password**: `pass_good`
- **MFA**: `1234` (if prompted)

## Step 5: Verify Deployment

Your functions should be available at:
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/plaid-create-link-token`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/plaid-exchange-token`  
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/plaid-refresh-accounts`

## Troubleshooting

### "Function not found" error:
- Verify function names are exactly: `plaid-create-link-token`, `plaid-exchange-token`, `plaid-refresh-accounts`
- Check that functions show "Deployed" status in dashboard

### "Plaid credentials not configured":
- Double-check secret names in Supabase: `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`
- Verify values are correct (no extra spaces)
- Make sure `PLAID_ENV` is set to `sandbox`

### "Invalid credentials" from Plaid:
- Verify your Plaid Client ID and Secret are for sandbox environment
- Check that your Plaid account is active and verified

## Alternative: Use Demo Mode

While setting up real Plaid, you can use Demo Mode which works immediately:

1. Select "Demo Mode" instead of "Real Plaid Sandbox"
2. Get 3 realistic test accounts instantly
3. All banking features work perfectly

## What Happens After Setup

Once configured correctly:
✅ Real Plaid Link will open with test banks  
✅ You can connect multiple test accounts  
✅ Account data saves to your Supabase database  
✅ All banking features work with real Plaid data  

The UI and database are already production-ready - you just need the backend functions deployed!