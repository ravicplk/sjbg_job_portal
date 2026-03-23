insert into storage.buckets (id, name, public) values ('company-logos', 'company-logos', true);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
values (
  'resumes', 
  'resumes', 
  false, 
  5242880, 
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- RLS for Storage (Logos)
create policy "Public can view logos" on storage.objects
  for select using (bucket_id = 'company-logos');

create policy "Employers can modify logos" on storage.objects
  for all using (
    bucket_id = 'company-logos' and
    auth.uid() in (select id from public.users where role = 'employer')
  );

-- RLS for Storage (Resumes)
create policy "Seekers can modify own resume" on storage.objects
  for all using (
    bucket_id = 'resumes' and (auth.uid() = owner)
  );

create policy "Employers can read resumes of applicants" on storage.objects
  for select using (
    bucket_id = 'resumes' and
    exists (
      select 1 from public.applications a
      join public.seeker_profiles s on a.seeker_id = s.id
      join public.jobs j on a.job_id = j.id
      join public.employer_profiles e on j.employer_id = e.id
      where s.user_id = storage.objects.owner
      and e.user_id = auth.uid()
    )
  );
