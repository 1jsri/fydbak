# Admin Access Troubleshooting Guide

## Your Current Status

Your database profile has been verified:
- **Email**: jawwadsri@gmail.com
- **Role**: admin ✓
- **Is Site Owner**: true ✓
- **Account Status**: active ✓

Your account is correctly configured in the database as an admin/owner.

## Next Steps to Access Admin Panel

### Step 1: Clear Your Browser Cache and Session

The most common issue is cached authentication data. Follow these steps:

1. **Open Browser DevTools**
   - Press F12 or right-click → Inspect

2. **Clear Application Data**
   - Go to the "Application" tab (Chrome/Edge) or "Storage" tab (Firefox)
   - Under "Storage", click "Clear site data" or:
     - Expand "Local Storage" → Delete all entries
     - Expand "Session Storage" → Delete all entries
     - Expand "Cookies" → Delete all cookies for your site

3. **Hard Refresh**
   - Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### Step 2: Log Out and Log Back In

1. If you're currently logged in, click your profile menu and log out
2. Close all browser tabs with your application
3. Open a new tab and navigate to your application
4. Log in with: **jawwadsri@gmail.com**

### Step 3: Check the Dashboard

After logging in, you should see:
- A golden/amber banner at the top of your dashboard saying "Admin Access Available"
- A debug line showing: `role=admin, is_site_owner=true, isOwner=true`
- A button to access the "Owner Dashboard"

### Step 4: Access Owner Panel

You can access the owner panel in two ways:

1. **Via Dashboard Button**
   - Click the "Owner Dashboard" button in the admin banner

2. **Direct URL**
   - Navigate to: `/owner`

### Step 5: Check Browser Console

If you still can't access the admin panel:

1. Open Browser DevTools (F12)
2. Go to the "Console" tab
3. Look for debug messages starting with `[AuthContext]`, `[useIsOwner]`, and `[OwnerRoute]`
4. Take a screenshot and share the console output

## Expected Debug Output

When everything is working correctly, you should see console logs like:

```
[AuthContext] Loading profile for user: f532a3a5-c9b4-4a91-8c7d-91094e69ba5f
[AuthContext] Profile loaded: {
  email: "jawwadsri@gmail.com",
  role: "admin",
  is_site_owner: true,
  account_status: "active"
}
[useIsOwner] Check: {
  profileExists: true,
  role: "admin",
  is_site_owner: true,
  isOwner: true
}
[OwnerRoute] State: {
  loading: false,
  hasUser: true,
  hasProfile: true,
  isOwner: true,
  profileRole: "admin",
  profileIsOwner: true
}
[OwnerRoute] Access granted!
```

## What Was Changed

I've added several debugging features to help diagnose issues:

1. **Console Logging**
   - AuthContext now logs when loading profiles
   - useIsOwner hook logs every permission check
   - OwnerRoute component logs all state changes

2. **Visual Debug Banner**
   - Dashboard now shows an admin banner when you have owner access
   - Includes debug information showing your role and owner status
   - Provides a direct link to the Owner Dashboard

3. **Database Verification**
   - Your profile was verified in the database
   - Your account is properly configured as admin/owner

## Common Issues and Solutions

### Issue: "Not redirecting to owner panel"
**Solution**: The profile data might not be loaded yet. Try logging out and back in.

### Issue: "Redirected to /dashboard when visiting /owner"
**Solution**: Your browser session has old data. Clear cache and cookies, then log in again.

### Issue: "Loading forever"
**Solution**: Check browser console for errors. There might be a network issue or RLS policy blocking access.

### Issue: "No admin banner on dashboard"
**Solution**: Your profile isn't loading correctly. Check console for `[AuthContext]` errors.

## Manual Database Check (For Developers)

If you want to manually verify your status in the database:

```sql
SELECT id, email, role, is_site_owner, account_status, current_plan
FROM profiles
WHERE email = 'jawwadsri@gmail.com';
```

Expected result:
- role: 'admin'
- is_site_owner: true
- account_status: 'active'

## Owner Panel Features

Once you have access, you'll be able to:

- **Owner Dashboard** (`/owner`)
  - View platform-wide statistics
  - See all users across all plans
  - Monitor trial activations
  - Track total responses

- **User Management** (`/owner/users`)
  - Search and filter all users
  - Change user plans and roles
  - Suspend or delete accounts
  - Add admin notes to user profiles
  - Export user data
  - Reset usage counters

- **Trial Links** (`/owner/trial-links`)
  - Create trial redemption codes
  - Set trial duration and plan type
  - Monitor trial redemptions
  - Track conversion rates

## Need More Help?

If you're still experiencing issues after following these steps:

1. Check the browser console for error messages
2. Take screenshots of:
   - The browser console output
   - What you see when visiting /owner
   - The debug banner on your dashboard (if visible)
3. Verify you're logged in with the correct email: jawwadsri@gmail.com

## Reverting Debug Logging

Once everything is working, you can remove the debug console.log statements from:
- `src/contexts/AuthContext.tsx`
- `src/hooks/useIsOwner.ts`
- `src/components/auth/OwnerRoute.tsx`
- `src/pages/manager/Dashboard.tsx` (remove the debug line from the banner)

This will clean up the console output in production.
