drop policy if exists "Employers can read applications to their jobs" on public.applications;
drop policy if exists "Employers can update application status" on public.applications;
drop policy if exists "Employers can update applications to their jobs" on public.applications;
drop policy if exists "Employers can view applications for their jobs" on public.applications;
drop policy if exists "Seekers can read own applications" on public.applications;
drop policy if exists "Seekers can insert own applications" on public.applications;

create policy "Employers can view applications for their jobs" on public.applications
  for select using ( public.check_employer_job(job_id) );
create policy "Employers can update application status" on public.applications
  for update using ( public.check_employer_job(job_id) );

create or replace function public.check_seeker_app(check_seeker_id uuid)
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.seeker_profiles s
    where s.id = check_seeker_id and s.user_id = auth.uid()
  );
$$;

create policy "Seekers can read own applications" on public.applications
  for select using ( public.check_seeker_app(seeker_id) );
create policy "Seekers can insert own applications" on public.applications
  for insert with check ( public.check_seeker_app(seeker_id) );
