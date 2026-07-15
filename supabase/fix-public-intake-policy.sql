-- Heartland Pride Center public intake repair
-- Run this in Supabase Dashboard > SQL Editor for project xrunawtqotumbsztboxo.

begin;

alter table public.applications enable row level security;

-- Public website visitors may submit new applications, but may not read,
-- update, or delete application records.
grant insert on table public.applications to anon;
grant insert on table public.applications to authenticated;
revoke select, update, delete on table public.applications from anon;

drop policy if exists "Public website can submit applications" on public.applications;
create policy "Public website can submit applications"
on public.applications
for insert
to anon
with check (true);

-- Signed-in Atlas HQ users retain operational access.
drop policy if exists "Authenticated staff can read applications" on public.applications;
create policy "Authenticated staff can read applications"
on public.applications
for select
to authenticated
using (true);

drop policy if exists "Authenticated staff can update applications" on public.applications;
create policy "Authenticated staff can update applications"
on public.applications
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated staff can delete applications" on public.applications;
create policy "Authenticated staff can delete applications"
on public.applications
for delete
to authenticated
using (true);

commit;
