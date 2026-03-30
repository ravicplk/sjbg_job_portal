-- Allow job seekers to keep up to 3 reusable resume files with remarks.
create table if not exists public.seeker_resumes (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references public.seeker_profiles(id) on delete cascade,
  slot smallint not null check (slot between 1 and 3),
  resume_path text not null,
  remark text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (seeker_id, slot)
);

create trigger on_seeker_resumes_updated
  before update on public.seeker_resumes
  for each row execute procedure public.handle_updated_at();

alter table public.seeker_resumes enable row level security;

drop policy if exists "Seekers can read own resumes list" on public.seeker_resumes;
create policy "Seekers can read own resumes list" on public.seeker_resumes
  for select using (
    seeker_id in (select id from public.seeker_profiles where user_id = auth.uid())
  );

drop policy if exists "Seekers can insert own resumes list" on public.seeker_resumes;
create policy "Seekers can insert own resumes list" on public.seeker_resumes
  for insert with check (
    seeker_id in (select id from public.seeker_profiles where user_id = auth.uid())
  );

drop policy if exists "Seekers can update own resumes list" on public.seeker_resumes;
create policy "Seekers can update own resumes list" on public.seeker_resumes
  for update using (
    seeker_id in (select id from public.seeker_profiles where user_id = auth.uid())
  );

drop policy if exists "Seekers can delete own resumes list" on public.seeker_resumes;
create policy "Seekers can delete own resumes list" on public.seeker_resumes
  for delete using (
    seeker_id in (select id from public.seeker_profiles where user_id = auth.uid())
  );

drop policy if exists "Employers can read resumes list of applicants" on public.seeker_resumes;
create policy "Employers can read resumes list of applicants" on public.seeker_resumes
  for select using (
    exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      join public.employer_profiles e on e.id = j.employer_id
      where a.seeker_id = public.seeker_resumes.seeker_id
        and e.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can manage seeker resumes" on public.seeker_resumes;
create policy "Admins can manage seeker resumes" on public.seeker_resumes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Snapshot which resume was used in an application.
alter table public.applications
  add column if not exists resume_path text,
  add column if not exists resume_remark text;

-- Backfill from legacy single resume_url.
insert into public.seeker_resumes (seeker_id, slot, resume_path, remark)
select s.id, 1, s.resume_url, 'Primary resume'
from public.seeker_profiles s
where s.resume_url is not null
  and not exists (
    select 1 from public.seeker_resumes r
    where r.seeker_id = s.id and r.slot = 1
  );

