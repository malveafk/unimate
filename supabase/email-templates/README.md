# Auth email templates

The emails Supabase sends for 4UNI, sent through Resend (SMTP set in
Authentication > Emails > SMTP Settings). Supabase does not read these files:
they are the source copy, pasted by hand into the dashboard. Edit them here
first, then paste again, so the repository stays the reference.

Where: Supabase dashboard > Authentication > Emails > Templates.

| Template in Supabase | File                  | Subject                     | Sent when                                             |
|----------------------|-----------------------|-----------------------------|-------------------------------------------------------|
| Confirm sign up      | `confirm-signup.html` | Confirm your email for 4UNI | `supabase.auth.signUp` in `app/components/AuthModal.tsx` |
| Reset password       | `reset-password.html` | Reset your 4UNI password    | `resetPasswordForEmail` in the same file              |

The other templates (Invite user, Magic link, Change email address,
Reauthentication) are not triggered by the site today and keep Supabase's
defaults.

Variables used, as documented by Supabase: `{{ .ConfirmationURL }}` (the link
that confirms or resets), `{{ .Email }}` (the recipient), `{{ .SiteURL }}`
(the Site URL in URL Configuration).

Rules the files follow, so email clients render them the same way: table
layout, inline styles only, no images (often blocked by default), no web
fonts, light background (dark mode in mail apps is unreliable), and the link
repeated as text under the button for clients that break buttons. Do not add
click tracking in Resend: it rewrites the confirmation link.
