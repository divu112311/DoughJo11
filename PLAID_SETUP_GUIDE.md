# 🏦 Plaid Setup Guide - Fix "Unable to Request Edge Function" Error

Your Edge Functions are deployed, but you need to configure Plaid credentials. Here's the exact fix:

## 🚨 The Issue

The "unable to request to edge function" error happens because:
1. ✅ Edge Functions are deployed (good!)
2. ❌ Plaid credentials are missing in Supabase secrets

## 🚀 Quick Fix (5 minutes)

### Step 1: Get Plaid Credentials

1. **Go to [dashboard.plaid.com](https://dashboard.plaid.com)**
2. **Sign up for free developer account**
3. **Create new application**
4. **Copy these credentials:**
   - **Client ID** (looks like: `5f8b2c4d3e1a9b7c6d5e4f3a`)
   - **Sandbox Secret** (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 2: Add to Supabase (CRITICAL!)

1. **Go to your Supabase Dashboard**
2. **Navigate to Settings → Secrets**
3. **Add these 3 secrets exactly:**

```
Name: PLAID_CLIENT_ID
Value: your_actual_client_id_here

Name: PLAID_SECRET  
Value: your_actual_sandbox_secret_here

Name: PLAID_ENV
Value: sandbox
```

**⚠️ IMPORTANT:** The secret names must be EXACTLY as shown above!

### Step 3: Test the Connection

1. **Go back to your DoughJo app**
2. **Navigate to Dashboard → Bank Accounts**
3. **Click "Add Account"**
4. **Click "Connect Bank Account"**
5. **You should now see Plaid Link open!**

## 🧪 Test with Sandbox Banks

Use these test credentials:
- **Username:** `user_good`
- **Password:** `pass_good`
- **MFA Code:** `1234` (if prompted)

## ✅ What Should Happen

After adding the secrets:
1. **Plaid Link opens** (popup window with bank selection)
2. **Choose "First Platypus Bank"** or any test bank
3. **Enter test credentials** (user_good / pass_good)
4. **Accounts appear** in your DoughJo dashboard
5. **Balances display** correctly

## 🔧 Troubleshooting

### Still getting "unable to request" error?
- **Double-check secret names** (case-sensitive!)
- **Verify credentials** are correct from Plaid dashboard
- **Wait 30 seconds** after adding secrets for them to take effect

### "Invalid credentials" error?
- **Make sure** you're using **sandbox** credentials, not production
- **Verify** Client ID and Secret are copied correctly (no extra spaces)

### Plaid Link doesn't open?
- **Check browser console** for error messages
- **Try incognito mode** to rule out browser extensions
- **Verify** all 3 secrets are added to Supabase

## 🎯 Expected Result

Once configured correctly, you'll have:
✅ **Real Plaid integration** with test banks  
✅ **Multiple account types** (checking, savings, credit)  
✅ **Live balance updates** from Plaid API  
✅ **Professional banking UI** that rivals major apps  
✅ **Secure token management** with proper encryption  

## 💡 Why This Works

Your Edge Functions are already deployed and working! They just need the Plaid API credentials to communicate with Plaid's servers. Once you add the secrets, the full integration will work perfectly.

## 🚀 Next Steps

After successful connection:
1. **Connect multiple test accounts** from different banks
2. **Test the refresh functionality** to update balances
3. **Try removing accounts** to test the full workflow
4. **Explore different account types** (checking, savings, credit cards)

Your DoughJo app will have **production-ready banking integration** in just 5 minutes! 🎉