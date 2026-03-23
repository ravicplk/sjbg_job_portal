# SJBG Job Portal

Next.js + Supabase job portal for job seekers, employers, and admins.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create local env file from template:

```bash
copy .env.example .env.local
```

3. Open `.env.local` and set real values from Supabase dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Optional for local scripts: `SUPABASE_SERVICE_ROLE_KEY`

Supabase API settings:
[https://supabase.com/dashboard/project/_/settings/api](https://supabase.com/dashboard/project/_/settings/api)

4. Run dev server:

```bash
npm run dev
```

5. Open:
[http://localhost:3000](http://localhost:3000)

## Prevent "Supabase URL and Key are required" Error

This error occurs when `.env.local` is missing or does not contain:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

To prevent it:
- Keep `.env.example` updated whenever env keys change.
- Create `.env.local` immediately after cloning (`copy .env.example .env.local`).
- Restart `npm run dev` after changing env variables.
