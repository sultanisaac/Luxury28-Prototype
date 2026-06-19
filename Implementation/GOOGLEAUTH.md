# Google OAuth Integration — Luxury28 Prototype

This document provides a complete, step-by-step guide to integrating **Google Sign-In** into the Luxury28-Prototype project using **Supabase Auth** and **Next.js**.

---

## Overview

Our stack: **Next.js 14 (App Router) + Supabase Auth + @supabase/ssr**

The flow works like this:
1. User clicks "Sign in with Google" on the login page.
2. A server action calls Supabase's `signInWithOAuth` which generates a Google redirect URL.
3. User is sent to Google's consent screen.
4. Google redirects back to our app at `/auth/callback`.
5. Supabase exchanges the code for a session.
6. A Supabase `auth.users` trigger fires, which auto-inserts a row into our `public.users` table.
7. The user is redirected to `/dashboard-redirect` based on their role.

---

## STEP 1 — Google Cloud Console Setup

> You only do this once. This creates the OAuth credentials Google needs.

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a new project (or select your existing one).
3. In the sidebar, navigate to **APIs & Services → Credentials**.
4. Click **+ CREATE CREDENTIALS → OAuth client ID**.
5. Set Application type to **Web application**.
6. Set a name e.g. `Luxury28 OAuth`.
7. Under **Authorized redirect URIs**, add the following two URIs:
   - **For local dev:**
     ```
     http://localhost:3000/auth/callback
     ```
   - **For production (Vercel):**
     ```
     https://your-vercel-domain.vercel.app/auth/callback
     ```
8. Click **CREATE**.
9. Copy the **Client ID** and **Client Secret** — you'll need them in Step 2.

---

## STEP 2 — Configure Supabase Dashboard

1. Go to your Supabase project: [supabase.com/dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication → Providers**.
3. Find **Google** in the list and toggle it **Enabled**.
4. Paste in your **Client ID** and **Client Secret** from Step 1.
5. Copy the **Callback URL (for OAuth)** shown on this screen. It looks like:
   ```
   https://iobwiajnzymniuxvxvdo.supabase.co/auth/v1/callback
   ```
6. Go back to Google Cloud Console → your OAuth Client → **Authorized redirect URIs**.
7. Add this **Supabase callback URL** as a third URI.
8. **Save** both Google and Supabase.

---

## STEP 3 — Add Supabase Auth Trigger (Handle New Google Users)

When a user signs in with Google for the first time, Supabase creates them in `auth.users` but **not** in `public.users`. We need a trigger to handle this.

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Function: Auto-insert new OAuth users into public.users with 'customer' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'given_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'family_name', ''),
    'customer',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Avoid duplicate inserts on re-login
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Fire on every new user in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

> **Important:** This ensures every Google user is immediately assigned the `customer` role and can be redirected correctly by your middleware.

---

## STEP 4 — Create the Auth Callback Route

Create the file: `app/auth/callback/route.ts`

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // After session is set, redirect to role-based dashboard
  return NextResponse.redirect(`${origin}/dashboard-redirect`)
}
```

---

## STEP 5 — Add the Server Action

In `app/auth/actions.ts`, add this new server action:

```ts
export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = headers().get('origin') // requires: import { headers } from 'next/headers'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    return redirect('/login?error=Could not authenticate with Google')
  }

  return redirect(data.url)
}
```

> Add `import { headers } from 'next/headers'` at the top of `actions.ts`.

---

## STEP 6 — Add Google Button to Login Page

In `app/(auth)/login/page.tsx`, add the Google button below the sign-in form:

```tsx
import { signInWithGoogle } from '@/app/auth/actions'

// Inside the JSX, below the <form> block:
<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t border-zinc-700" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
  </div>
</div>

<form action={signInWithGoogle}>
  <Button
    type="submit"
    variant="outline"
    className="w-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700 flex items-center gap-3"
  >
    {/* Google SVG Icon */}
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Sign in with Google
  </Button>
</form>
```

---

## STEP 7 — Add Environment Variables

### Local `.env` file:
```bash
# These are already set — no changes needed for OAuth:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

No additional env vars are needed. The Google Client ID/Secret live in **Supabase**, not in your app.

### On Vercel:
No extra environment variables needed beyond what you already have.

---

## STEP 8 — Test the Flow

1. Run `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click **"Sign in with Google"**
4. You should be redirected to Google's consent screen
5. After approving, you land back at `/auth/callback` → `/dashboard-redirect`
6. Check your **Supabase Dashboard → Authentication → Users** — the new user should appear
7. Check **Table Editor → public.users** — a row with `role: customer` should be auto-created

---

## Checklist

- [x] Google Cloud project created with OAuth credentials
- [x] Supabase callback URI added to Google Cloud Console
- [x] Google provider enabled in Supabase Dashboard
- [x] `handle_new_user` SQL trigger applied
- [x] `app/auth/callback/route.ts` created
- [x] `signInWithGoogle` server action added to `app/auth/actions.ts`
- [x] Google Sign-In button added to login page
- [ ] Flow tested end-to-end locally
- [ ] Flow tested on Vercel production

---

## Notes & Gotchas

- **Existing users:** If a user previously signed up with email/password using the same Google email, Supabase will link the accounts automatically.
- **Role assignment:** The trigger always defaults new Google users to `customer`. Admin/staff roles must be manually assigned from the Admin dashboard.
- **`ON CONFLICT DO NOTHING`:** The trigger is idempotent — it won't create duplicate rows if the user logs in multiple times.
