# TryCritique Auth Setup

Use this checklist before adding paid billing.

## Vercel environment variables

Add these in Vercel Project Settings -> Environment Variables for Production and Preview:

```text
VITE_SITE_URL=https://trycritique.com
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Redeploy after saving.

`SUPABASE_SERVICE_ROLE_KEY` must be added only in Vercel environment variables. Do not put it in frontend code or expose it in the browser.

## Supabase URLs

In Supabase Authentication -> URL Configuration:

```text
Site URL: https://trycritique.com
Redirect URLs:
https://trycritique.com
https://trycritique.com/auth/login
https://trycritique.com/auth/reset-password
http://localhost:5173/auth/login
http://localhost:5173/auth/reset-password
```

## SMTP

In Supabase Authentication -> Emails -> SMTP Settings:

- Enable custom SMTP.
- Use a production email provider such as Resend, Brevo, SendGrid, or another SMTP provider.
- Use a branded sender such as `TryCritique <support@trycritique.com>`.

## Email templates

Update these templates in Supabase Authentication -> Emails -> Templates:

- Confirm sign up
- Reset password
- Magic link or OTP, if enabled

Keep the text short, branded, and focused on one button.

Use this Reset password body so the app receives a recovery token it can verify:

```html
<h2>Reset your password</h2>

<p>We received a request to reset your password. Follow the link below to choose a new one.</p>

<p>
  <a href="{{ .SiteURL }}/auth/reset-password?token_hash={{ .TokenHash }}&type=recovery">Reset password</a>
</p>

<p>If you didn't request this, you can safely ignore this email.</p>
```

For Confirm sign up, keep Supabase's default `{{ .ConfirmationURL }}` link unless you add a custom confirmation page.

## Test flow

1. Register a new account with a real email.
2. Confirm the email.
3. Sign in.
4. Click Forgot password.
5. Open the reset link and set a new password.
6. Sign in again.

## Stripe billing setup

Add these in Vercel Project Settings -> Environment Variables for Production and Preview:

```text
STRIPE_SECRET_KEY=sk_live_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
VITE_SITE_URL=https://trycritique.com
```

In Stripe Dashboard:

1. Create a product named `TryCritique Pro`.
2. Add a recurring monthly price for `$10/month`.
3. Add a recurring yearly price for `$86/year`.
4. Copy each price ID into Vercel as `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_YEARLY_PRICE_ID`.
5. Enable Customer Portal in Stripe Billing so users can manage cards, invoices, and cancellation.
6. Redeploy Vercel after saving the variables.

The app uses `/api/create-checkout-session` for Stripe Checkout and `/api/create-customer-portal` for the billing portal.
