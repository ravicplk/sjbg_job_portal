-- SECURITY HARDENING
-- 1) Remove broad authenticated read access to all resume files.
-- 2) Restrict employer logo modifications to their own objects only.
-- 3) Remove broad users-table read and allow employers to read only applicant user rows.

-- Resume storage: drop overly broad read policy introduced previously.
drop policy if exists "Authenticated users can read resumes" on storage.objects;

-- Optionally allow admins to read resume files.
drop policy if exists "Admins can read resumes" on storage.objects;
create policy "Admins can read resumes" on storage.objects
  for select to authenticated using (
    bucket_id = 'resumes'
    and public.is_admin()
  );

-- Company logos: employers should only modify objects they own.
drop policy if exists "Employers can modify logos" on storage.objects;
drop policy if exists "Employers can modify own logos" on storage.objects;
create policy "Employers can modify own logos" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'company-logos'
    and owner = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role = 'employer'
    )
  )
  with check (
    bucket_id = 'company-logos'
    and owner = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role = 'employer'
    )
  );

-- Users table: remove broad authenticated read.
drop policy if exists "Basic user info viewable by authenticated" on public.users;
drop policy if exists "Users can read own data" on public.users;

-- Employers may read users rows only for seekers who applied to one of their jobs.
drop policy if exists "Employers can read applicant user rows" on public.users;
create policy "Employers can read applicant user rows" on public.users
  for select to authenticated using (
    exists (
      select 1
      from public.seeker_profiles s
      join public.applications a on a.seeker_id = s.id
      join public.jobs j on j.id = a.job_id
      join public.employer_profiles e on e.id = j.employer_id
      where s.user_id = public.users.id
        and e.user_id = auth.uid()
    )
  );
