create or replace function public.check_employer_job(check_job_id uuid)
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.jobs j
    join public.employer_profiles e on j.employer_id = e.id
    where j.id = check_job_id and e.user_id = auth.uid()
  );
$$;

drop policy if exists "Employers can view applications for their jobs" on public.applications;
create policy "Employers can view applications for their jobs" on public.applications
  for select using ( public.check_employer_job(job_id) );

drop policy if exists "Employers can update application status" on public.applications;
create policy "Employers can update application status" on public.applications
  for update using ( public.check_employer_job(job_id) );
