This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Supabase setup

Auth (email magic links) and data (organizations, events, registrations) are
backed by [Supabase](https://supabase.com). One-time setup:

1. **Env vars** — set these in Vercel (the Supabase integration does this
   automatically) and locally in `.env.local` (`vercel env pull` works too):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # server-only, never exposed to the browser
   ```

2. **Schema** — run the files in `supabase/migrations/` in order in the
   Supabase SQL editor (or `supabase db push` if you use the CLI).

3. **Auth config** — in the Supabase dashboard under Authentication → URL
   Configuration, set your Site URL and add your deployment URLs (including
   Vercel preview URLs and `http://localhost:3000`) to the redirect allowlist
   so magic links can return to `/auth/callback`.

   **Strongly recommended:** change the Magic Link email template
   (Authentication → Email Templates → Magic Link) to link to
   `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`.
   The default `{{ .ConfirmationURL }}` uses a PKCE flow that only completes
   in the same browser that requested the link — opening it from a mail
   app's in-app browser or another device silently fails and the user stays
   signed out. The `token_hash` flow works everywhere and is supported by
   the callback route. If a magic link redirect ever falls back to the Site
   URL with the session in the URL fragment (`#access_token=...`), the
   client-side `AuthSessionRescue` component recovers it automatically.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
