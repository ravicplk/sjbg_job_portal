create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
language plpgsql
as $$
declare
  _role public.user_role;
begin
  -- Try to parse the role from JSON, fallback specifically to 'job_seeker'
  begin
    _role := (new.raw_user_meta_data->>'role')::public.user_role;
  exception when others then
    _role := 'job_seeker'::public.user_role;
  end;

  -- Insert the public.users record
  insert into public.users (id, email, first_name, last_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    coalesce(_role, 'job_seeker'::public.user_role)
  );

  -- Automatically initialize the respective role profile
  if coalesce(_role, 'job_seeker'::public.user_role) = 'employer' then
    insert into public.employer_profiles (user_id) values (new.id);
  else
    insert into public.seeker_profiles (user_id) values (new.id);
    insert into public.resume_data (seeker_id) 
    select id from public.seeker_profiles where user_id = new.id;
  end if;

  return new;
end;
$$;
