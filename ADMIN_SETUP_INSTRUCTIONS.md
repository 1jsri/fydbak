# Admin Role Setup Instructions

## Overview

Your SaaS application has been successfully configured with role-based access control (RBAC) for production security. The system now uses a `role` column instead of the `is_site_owner` boolean flag for permission management.

## What Was Implemented

### 1. Database Changes
- Modified the `profiles` table to accept `'admin'` as a valid role (in addition to `'manager'` and `'rep'`)
- Created comprehensive RLS policies that give admins full access to all data
- Added helper functions: `is_admin()` and updated `is_site_owner()` to use role-based checks
- Created performance indexes on the role column

### 2. Frontend Changes
- Updated TypeScript types to include `'admin'` in the role union type
- Modified `useIsOwner` hook to check `role === 'admin'` instead of `is_site_owner`
- Updated UserManagement page to display "Admin" badge based on role
- All existing components continue to work via the `useIsOwner` hook

### 3. Security Improvements
- All sensitive tables now have admin override policies
- Regular users can only access their own data
- Anonymous users can still access active surveys (unchanged)
- Database-level security ensures no bypass is possible from the application layer

## Setting Your Admin Account

**IMPORTANT:** You must update the migration with your email address.

1. Open the migration file in your Supabase dashboard or SQL editor
2. Find this line in the migration:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'YOUR_EMAIL_HERE';
   ```
3. Replace `'YOUR_EMAIL_HERE'` with your actual email address (keep the quotes)
4. The migration has already been applied, so you can run this UPDATE statement directly:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'your-actual-email@example.com';
   ```

## Verification Steps

After setting your admin email, verify the setup:

### 1. Check Your Admin Status
```sql
SELECT email, role, is_site_owner, current_plan
FROM profiles
WHERE role = 'admin';
```

You should see your email with `role = 'admin'`.

### 2. Test Admin Access
1. Log in with your admin account
2. Navigate to `/owner` - you should see the Owner Dashboard
3. Navigate to `/owner/users` - you should see all user profiles
4. Verify you can view all surveys and responses across all users

### 3. Test Regular User Restrictions
1. Create a test user account (or use an existing non-admin account)
2. Log in as the test user
3. Verify they:
   - Can only see their own dashboard
   - Cannot access `/owner` routes (redirected to `/dashboard`)
   - Can only see their own surveys and data
   - Cannot view other users' information

### 4. Test RLS Policies
Run these queries as a regular user (not admin) to verify security:

```sql
-- Should only return the current user's profile
SELECT * FROM profiles;

-- Should only return the current user's surveys
SELECT * FROM surveys;

-- Should fail or return nothing for other users' data
SELECT * FROM profiles WHERE id != auth.uid();
```

## Security Checklist

- [ ] Admin email has been set in the database
- [ ] Admin account can access `/owner` routes
- [ ] Regular users cannot access `/owner` routes
- [ ] Regular users can only see their own data
- [ ] Anonymous users can still access active surveys via short codes
- [ ] All tables have RLS enabled and policies are working
- [ ] Build completed successfully without errors

## Additional Supabase Security Settings

For production, also configure these settings in your Supabase dashboard:

### 1. Disable Public Signups (Optional)
- Go to: Authentication → Settings → Auth Providers
- Set "Enable email provider" to off if you want invitation-only signups
- Or implement your own invite system

### 2. Enable Email Confirmation (Recommended)
- Go to: Authentication → Settings → Auth Providers → Email
- Enable "Confirm email" option
- Users must verify their email before accessing the system

### 3. Configure Email Templates
- Go to: Authentication → Email Templates
- Customize the confirmation, password reset, and magic link templates
- Add your branding and custom messaging

## Role Types

Your system now supports three role types:

- **`admin`** - Full access to all data, user management, and owner dashboard
- **`manager`** - Can create surveys, view their own responses, standard dashboard
- **`rep`** - Can take surveys (limited or no dashboard access)

## Future Considerations

### Option 1: Remove `is_site_owner` Column
After verifying everything works, you can remove the legacy `is_site_owner` column:

```sql
ALTER TABLE profiles DROP COLUMN is_site_owner;
```

**Note:** Keep it for now during the transition period as a backup.

### Option 2: Multiple Admins
To add more admins, simply update their role:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'second-admin@example.com';
```

### Option 3: Fine-Grained Permissions
For more granular control, consider:
- Adding more role types (e.g., 'moderator', 'support')
- Creating a permissions table with role-to-permission mappings
- Implementing organization/team-level access controls

## Troubleshooting

### Issue: Cannot access owner dashboard after setting admin role
**Solution:** Clear your browser cache and local storage, then log out and log back in to refresh the session.

### Issue: RLS policies blocking legitimate access
**Solution:** Check the policies with:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### Issue: Admin can't see all data
**Solution:** Verify the role is set correctly:
```sql
SELECT id, email, role FROM profiles WHERE email = 'your-email@example.com';
```

## Support

If you encounter any issues with the RBAC implementation:
1. Verify your email was correctly set in the database
2. Check that you're logged in with the admin account
3. Ensure the migration was applied successfully
4. Review the RLS policies in your Supabase dashboard

## Migration Reference

The migration file is located at:
```
/supabase/migrations/[timestamp]_add_admin_role_and_rbac_security.sql
```

This migration is **non-destructive** and maintains all existing data and functionality.
