create type user_role as enum ('employer', 'job_seeker', 'admin');
create type job_role_type as enum ('Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance');
create type job_experience_level as enum ('Entry-Level', 'Mid-Level', 'Senior', 'Executive');
create type job_status as enum ('active', 'closed', 'draft');
create type application_status as enum ('pending', 'shortlisted', 'rejected', 'hired');

-- USERS Table
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'job_seeker',
  first_name text,
  last_name text,
  email text unique not null,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EMPLOYER PROFILES
create table public.employer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  company_name text,
  industry text,
  about text,
  website text,
  phone text,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id)
);

-- JOBS
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references public.employer_profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  requirements text not null,
  category text,
  location text,
  role_type job_role_type not null,
  experience_level job_experience_level not null,
  salary_range text,
  deadline date,
  status job_status default 'draft' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SEEKER PROFILES
create table public.seeker_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  headline text,
  about text,
  skills text[],
  location text,
  phone text,
  linkedin_url text,
  resume_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id)
);

-- APPLICATIONS
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade not null,
  seeker_id uuid references public.seeker_profiles(id) on delete cascade not null,
  cover_note text,
  status application_status default 'pending' not null,
  applied_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (job_id, seeker_id)
);

-- RESUME DATA
create table public.resume_data (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid references public.seeker_profiles(id) on delete cascade not null,
  personal jsonb default '{}'::jsonb not null,
  summary text,
  experience jsonb[] default '{}',
  education jsonb[] default '{}',
  skills text[] default '{}',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (seeker_id)
);

-- FUNCS & TRIGGERS FOR UPDATED_AT
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_applications_updated
  before update on public.applications
  for each row execute procedure public.handle_updated_at();

create trigger on_resume_data_updated
  before update on public.resume_data
  for each row execute procedure public.handle_updated_at();

-- Trigger for auth.users to public.users mapping
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, first_name, last_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'job_seeker'::user_role)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
