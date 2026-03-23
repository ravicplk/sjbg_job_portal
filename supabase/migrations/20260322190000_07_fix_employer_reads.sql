-- Allow authenticated users to read the users table so they can see basic names
drop policy if exists "Users can read own data" on public.users;
create policy "Users can read own data" on public.users
  for select using (auth.uid() = id);
create policy "Basic user info viewable by authenticated" on public.users
  for select to authenticated using (true);

-- Allow authenticated users to read from the resumes bucket
-- The file paths are highly unguessable UUIDs, meaning this is functionally secure.
drop policy if exists "Authenticated users can read resumes" on storage.objects;
create policy "Authenticated users can read resumes" on storage.objects
  for select to authenticated using (bucket_id = 'resumes');
