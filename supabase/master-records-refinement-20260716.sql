begin;

alter table public.businesses
  add column if not exists notes text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'master-note-attachments',
  'master-note-attachments',
  false,
  26214400,
  array[
    'image/jpeg','image/png','image/webp','image/heic',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Staff can upload master note attachments" on storage.objects;
create policy "Staff can upload master note attachments"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'master-note-attachments');

drop policy if exists "Staff can read master note attachments" on storage.objects;
create policy "Staff can read master note attachments"
on storage.objects
for select
to authenticated
using (bucket_id = 'master-note-attachments');

drop policy if exists "Staff can update master note attachments" on storage.objects;
create policy "Staff can update master note attachments"
on storage.objects
for update
to authenticated
using (bucket_id = 'master-note-attachments')
with check (bucket_id = 'master-note-attachments');

drop policy if exists "Staff can delete master note attachments" on storage.objects;
create policy "Staff can delete master note attachments"
on storage.objects
for delete
to authenticated
using (bucket_id = 'master-note-attachments');

commit;
