-- Payments table to record job posting fees
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid references public.jobs(id) on delete cascade not null,
  employer_id     uuid references public.employer_profiles(id) on delete cascade not null,
  amount          integer not null default 2500,
  currency        text    not null default 'LKR',
  status          text    not null default 'completed'
                    check (status in ('pending', 'completed', 'failed')),
  card_last4      text,
  cardholder_name text,
  created_at      timestamp with time zone default timezone('utc', now()) not null
);

alter table public.payments enable row level security;

-- Employers can view their own payment records
create policy "Employers view own payments"
  on public.payments for select
  using (
    employer_id in (
      select id from public.employer_profiles where user_id = auth.uid()
    )
  );

-- Employers can insert payment records for their own profile
create policy "Employers insert own payments"
  on public.payments for insert
  with check (
    employer_id in (
      select id from public.employer_profiles where user_id = auth.uid()
    )
  );

-- Admins can view all payments
create policy "Admins view all payments"
  on public.payments for select
  using (public.is_admin());
