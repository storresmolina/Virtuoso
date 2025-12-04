# Password Reset Setup Guide

## Features Implemented ✅
1. **Forgot Password Page** - Users can request password reset link via email
2. **Reset Password Page** - Users can set new password using reset link
3. **Login Integration** - "Forgot password?" link on login page

## Supabase Configuration Required

### 1. Enable Email Templates (Optional but Recommended)
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Find "Reset Password" template
3. Customize the email template if desired (optional)
4. Make sure the template includes the magic link: `{{ .ConfirmationURL }}`

### 2. Configure Site URL
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL** to your app URL:
   - Development: `http://localhost:5173` (or your dev server port)
   - Production: `https://your-app.vercel.app`
3. Add **Redirect URLs** (comma-separated):
   - `http://localhost:5173/reset-password`
   - `https://your-app.vercel.app/reset-password`

### 3. Test the Flow

#### Development:
1. Go to login page
2. Click "Forgot password?"
3. Enter your email
4. Check your email inbox for reset link
5. Click the link (will redirect to `/reset-password` with token in URL hash)
6. Enter new password
7. Login with new password

#### Production:
Same flow but with your production URL.

## How It Works

1. **Request Reset**: `resetPassword(email)` sends email via Supabase Auth
2. **Email Link**: Contains token in URL hash: `#access_token=...&type=recovery`
3. **App Detection**: `App.tsx` checks URL hash on mount, shows ResetPassword page if `type=recovery`
4. **Update Password**: `updatePassword(newPassword)` uses Supabase session from URL token
5. **Redirect**: After success, user redirects to login

## Files Modified
- `src/auth/supabaseAuth.ts` - Added `resetPassword()` and `updatePassword()`
- `src/pages/ForgotPassword.tsx` - New page for requesting reset
- `src/pages/ResetPassword.tsx` - New page for setting new password
- `src/pages/Login.tsx` - Added "Forgot password?" link
- `src/App.tsx` - Added routing for forgot/reset password views

## Security Notes
- Reset links expire in 1 hour (Supabase default)
- Tokens are single-use only
- Email must exist in system to receive link
- No user enumeration: same message shown whether email exists or not
