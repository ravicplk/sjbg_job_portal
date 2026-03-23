alter table public.users enable row level security;
alter table public.employer_profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.seeker_profiles enable row level security;
alter table public.applications enable row level security;
alter table public.resume_data enable row level security;

-- USERS
create policy "Users can read own row" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own row" on public.users
  for update using (auth.uid() = id);

-- EMPLOYER PROFILES
create policy "Employers can read own profile" on public.employer_profiles
  for select using (auth.uid() = user_id);
create policy "Employers can insert own profile" on public.employer_profiles
  for insert with check (auth.uid() = user_id);
create policy "Employers can update own profile" on public.employer_profiles
  for update using (auth.uid() = user_id);

create policy "Anyone can read employer profiles" on public.employer_profiles
  for select using (true);

-- JOBS
create policy "Employers can manage own jobs" on public.jobs
  for all using (
    employer_id in (select id from public.employer_profiles where user_id = auth.uid())
  );
create policy "Anyone can read active jobs" on public.jobs
  for select using (status = 'active');

-- SEEKER PROFILES
create policy "Seekers can read own profile" on public.seeker_profiles
  for select using (auth.uid() = user_id);
create policy "Seekers can insert own profile" on public.seeker_profiles
  for insert with check (auth.uid() = user_id);
create policy "Seekers can update own profile" on public.seeker_profiles
  for update using (auth.uid() = user_id);

create policy "Employers can read seeker profiles who applied to their jobs" on public.seeker_profiles
  for select using (
    exists (
      select 1 from public.applications a
      join public.jobs j on a.job_id = j.id
      join public.employer_profiles e on j.employer_id = e.id
      where a.seeker_id = public.seeker_profiles.id
      and e.user_id = auth.uid()
    )
  );

-- APPLICATIONS
create policy "Seekers can insert own applications" on public.applications
  for insert with check (
    seeker_id in (select id from public.seeker_profiles where user_id = auth.uid())
  );
create policy "Seekers can read own applications" on public.applications
  for select using (
    seeker_id in (select id from public.seeker_profiles where user_id = auth.uid())
  );

create policy "Employers can read applications to their jobs" on public.applications
  for select using (
    job_id in (
      select j.id from public.jobs j
      join public.employer_profiles e on j.employer_id = e.id
      where e.user_id = auth.uid()
    )
  );
create policy "Employers can update applications to their jobs" on public.applications
  for update using (
    job_id in (
      select j.id from public.jobs j
      join public.employer_profiles e on j.employer_id = e.id
      where e.user_id = auth.uid()
    )
  );

-- RESUME DATA
create policy "Seekers can read own resume" on public.resume_data
  for select using (
    seeker_id in (select id from public.seeker_profiles where user_id = auth.uid())
  );
create policy "Seekers can insert own resume" on public.resume_data
  for insert with check (
    seeker_id in (select id from public.seeker_profiles where user_id = auth.uid())
  );
create policy "Seekers can update own resume" on public.resume_data
  for update using (
    seeker_id in (select id from public.seeker_profiles where user_id = auth.uid())
  );

create policy "Employers can read resumes of applicants" on public.resume_data
  for select using (
    exists (
      select 1 from public.applications a
      join public.jobs j on a.job_id = j.id
      join public.employer_profiles e on j.employer_id = e.id
      where a.seeker_id = public.resume_data.seeker_id
      and e.user_id = auth.uid()
    )
  );
