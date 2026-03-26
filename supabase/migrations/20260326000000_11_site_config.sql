-- Site-wide key/value configuration (e.g. announcement bar text)
create table if not exists public.site_config (
  key   text primary key,
  value text not null default ''
);

-- Seed default announcement
insert into public.site_config (key, value)
values ('announcement_text', 'Now accepting early employer listings for upcoming launch.')
on conflict (key) do nothing;

-- RLS: everyone can read, only admins can write
alter table public.site_config enable row level security;

create policy "Public read site_config"
  on public.site_config for select using (true);

create policy "Admin insert site_config"
  on public.site_config for insert with check (public.is_admin());

create policy "Admin update site_config"
  on public.site_config for update using (public.is_admin());
