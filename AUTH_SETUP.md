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

## Dodo Payments billing setup

Add these in Vercel Project Settings -> Environment Variables for Production and Preview:

```text
DODO_PAYMENTS_API_KEY=...
DODO_MONTHLY_PRODUCT_ID=...
DODO_YEARLY_PRODUCT_ID=...
DODO_PAYMENTS_WEBHOOK_KEY=...
DODO_PAYMENTS_ENVIRONMENT=live_mode
DODO_BUSINESS_ID=...
VITE_SITE_URL=https://trycritique.com
```

In Dodo Payments Dashboard:

1. Create a subscription product for `TryCritique Pro Monthly` at `$10/month`.
2. Create a subscription product for `TryCritique Pro Yearly` at `$86/year`.
3. Copy each product ID into Vercel as `DODO_MONTHLY_PRODUCT_ID` and `DODO_YEARLY_PRODUCT_ID`.
4. In Developer -> API Keys, create a write-enabled API key and add it as `DODO_PAYMENTS_API_KEY`.
5. In Developer -> Webhooks, add endpoint `https://trycritique.com/api/dodo-webhook`.
6. Select subscription lifecycle events:
   - `subscription.active`
   - `subscription.updated`
   - `subscription.on_hold`
   - `subscription.renewed`
   - `subscription.plan_changed`
   - `subscription.cancelled`
   - `subscription.failed`
   - `subscription.expired`
7. Copy the webhook signing key into Vercel as `DODO_PAYMENTS_WEBHOOK_KEY`.
8. Copy the business ID into Vercel as `DODO_BUSINESS_ID` so the app can fall back to Dodo's email-based portal.
9. Run `supabase/schema.sql` in Supabase SQL Editor so subscription status can be saved.
10. Redeploy Vercel after saving the variables.

The app uses `/api/create-checkout-session` for Dodo Checkout and `/api/create-customer-portal` for Dodo Customer Portal.
Dodo sends subscription changes to `/api/dodo-webhook`, and the app reads the saved status from `/api/billing-status` with the signed-in user's session.
