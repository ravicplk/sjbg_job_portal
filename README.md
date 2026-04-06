# SJBG Job Portal

Next.js + Supabase job portal for job seekers, employers, and admins.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
copy .env.example .env.local
```

If you don't have `.env.example`, create `.env.local` manually in the project root:

```bash
notepad .env.local
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

## Local QA Automation (Free)

This repo includes a local QA setup:
- **E2E UI tests**: Playwright
- **API route tests**: Playwright (API project)
- **Unit tests**: Vitest (Zod validation)
- **Load smoke tests**: k6

### One-time setup

Install Playwright browsers:

```bash
npx playwright install
```

Install k6:
- Windows: `choco install k6` (or `scoop install k6`)
- macOS: `brew install k6`

### Optional: role-based E2E test accounts

If you set these environment variables, E2E smoke tests will validate seeker/employer/admin pages:

```bash
setx E2E_SEEKER_EMAIL "you@example.com"
setx E2E_SEEKER_PASSWORD "yourPassword"
setx E2E_EMPLOYER_EMAIL "employer@example.com"
setx E2E_EMPLOYER_PASSWORD "yourPassword"
setx E2E_ADMIN_EMAIL "admin@example.com"
setx E2E_ADMIN_PASSWORD "yourPassword"
```

Restart your terminal after using `setx`.

### Run QA locally

Start the dev server:

```bash
npm run dev
```

In another terminal:

```bash
npm run test:unit
npm run test:e2e
npm run test:e2e:api
npm run test:load:base
```
