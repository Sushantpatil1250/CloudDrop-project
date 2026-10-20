-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

-- 1. Create a PRIVATE bucket named "files" with a 5 MB limit and allowed file types.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'files', 'files', false, 5242880,
  array[
    'image/png','image/jpeg','image/gif','image/webp',
    'application/pdf','text/plain','application/zip',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2. Security policies: a logged-in user can only access files inside the folder named after their own user id.
--    Files are stored as  <user-id>/<timestamp>_<filename>

create policy "CloudDrop: users read own files"
on storage.objects for select to authenticated
using (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "CloudDrop: users upload to own folder"
on storage.objects for insert to authenticated
with check (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "CloudDrop: users delete own files"
on storage.objects for delete to authenticated
using (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);
