# Edge Function Deployment Guide

## Important: WebContainer Environment Notice
Since you're working in a browser-based environment (WebContainer), the Supabase CLI cannot be installed or used directly. You'll need to deploy the Edge Functions manually through the Supabase Dashboard.

## Manual Deployment via Supabase Dashboard

### Step 1: Access Your Supabase Dashboard
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to "Edge Functions" in the left sidebar

### Step 2: Deploy plaid-create-link-token Function
1. Click "Create Function" or "New Function"
2. Name it: `plaid-create-link-token`
3. Copy the entire code from `supabase/functions/plaid-create-link-token/index.ts`
4. Paste it into the function editor
5. Click "Deploy Function"

### Step 3: Deploy plaid-exchange-token Function
1. Click "Create Function" or "New Function"
2. Name it: `plaid-exchange-token`
3. Copy the entire code from `supabase/functions/plaid-exchange-token/index.ts`
4. Paste it into the function editor
5. Click "Deploy Function"

### Step 4: Deploy plaid-refresh-accounts Function
1. Click "Create Function" or "New Function"
2. Name it: `plaid-refresh-accounts`
3. Copy the entire code from `supabase/functions/plaid-refresh-accounts/index.ts`
4. Paste it into the function editor
5. Click "Deploy Function"

### Step 5: Set Environment Variables
1. In your Supabase dashboard, go to Settings > Secrets
2. Add the following secrets:
   - `PLAID_CLIENT_ID`: Your Plaid client ID
   - `PLAID_SECRET`: Your Plaid secret key
   - `PLAID_ENV`: Set to `sandbox` for testing or `production` for live

### Step 6: Verify Deployment
After deployment, your Edge Functions will be available at:
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/plaid-create-link-token`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/plaid-exchange-token`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/plaid-refresh-accounts`

Replace `YOUR_PROJECT_REF` with your actual Supabase project reference ID.

## Testing the Functions

You can test the functions using curl or your application:

### Test plaid-create-link-token:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/plaid-create-link-token \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
```

### Test plaid-exchange-token:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/plaid-exchange-token \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"publicToken": "public-sandbox-token", "userId": "test-user-id", "institutionName": "Test Bank"}'
```

## Troubleshooting

### If functions fail to deploy:
1. Check that you copied the entire function code correctly
2. Verify that all required environment variables are set in Secrets
3. Check the function logs in the Supabase dashboard

### If you get CORS errors:
The functions already include proper CORS headers. If you still encounter CORS issues:
1. Verify the function is deployed correctly
2. Check that your frontend is making requests to the correct URL
3. Ensure the Authorization header includes your Supabase anon key

### To view function logs:
1. Go to Edge Functions in your Supabase dashboard
2. Click on the function name
3. View the "Logs" tab for debugging information

## Alternative: Local Development (For Future Reference)

If you want to work locally in the future (outside of WebContainer), you can use the Supabase CLI:

### Prerequisites
- Install Supabase CLI locally
- Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
- Deploy functions: `supabase functions deploy function-name`

But for now, manual deployment through the dashboard is the recommended approach.

## Verification

After successful deployment:
1. All three Plaid functions should appear in your Edge Functions list
2. Each function should show a "Deployed" status
3. Your application will automatically use these deployed functions
4. Test the Plaid integration in your app to confirm everything works

The functions are now ready to handle Plaid integration requests from your application!