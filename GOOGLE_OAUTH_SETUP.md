# Google OAuth Setup Guide for DoughJo

Google OAuth is currently not working because it needs to be configured in your Supabase project. Here's how to set it up:

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback` (for local development)

## Step 2: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list and click to configure
4. Enable Google provider
5. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
6. Set the redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`

## Step 3: Update Site URL

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Set your **Site URL** to:
   - Production: `https://your-domain.com`
   - Development: `http://localhost:5173`
3. Add redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:5173/auth/callback`

## Step 4: Test the Integration

1. Save all configurations
2. Try the Google sign-in button in your app
3. You should be redirected to Google's OAuth consent screen
4. After authorization, you'll be redirected back to your app

## Troubleshooting

### "Google sign-in is not configured" Error
- Make sure Google provider is enabled in Supabase
- Verify Client ID and Secret are correctly entered
- Check that redirect URLs match exactly

### "Redirect URI mismatch" Error
- Ensure the redirect URI in Google Cloud Console matches Supabase
- Format should be: `https://your-project-ref.supabase.co/auth/v1/callback`

### "OAuth consent screen" Issues
- Configure the OAuth consent screen in Google Cloud Console
- Add your domain to authorized domains
- Set up required scopes (email, profile)

## Current Fallback

Until Google OAuth is configured, users can:
- ✅ Sign up with email and password
- ✅ Sign in with email and password  
- ✅ Reset password via email
- ✅ Email verification
- ❌ Google OAuth (shows helpful error message)

The app gracefully handles the missing Google OAuth configuration and provides clear feedback to users.