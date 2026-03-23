-- Create helper function to check if current user is an admin
create or replace function public.is_admin()
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Jobs: Admins can update/delete any job
drop policy if exists "Admins can manage jobs" on public.jobs;
create policy "Admins can manage jobs" on public.jobs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Users: Admins can manage any user profile data
drop policy if exists "Admins can manage users" on public.users;
create policy "Admins can manage users" on public.users
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Applications: Admins can manage applications
drop policy if exists "Admins can manage applications" on public.applications;
create policy "Admins can manage applications" on public.applications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
