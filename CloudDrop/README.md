# CloudDrop – Cloud-Based File Storage System (Supabase version)

Upload, list, download, and delete files using **Supabase Storage** and **Supabase Auth**.

## Tech stack
HTML5, CSS3, JavaScript (ES modules), Supabase JS client v2, Supabase Storage, Supabase Authentication.

## Setup

1. Create a free project at https://supabase.com (no card needed on the Free plan).
2. **Authentication -> Sign In / Providers -> Email**: for easy testing, turn **off** "Confirm email".
3. **SQL Editor -> New query**: paste all of `setup.sql` and click **Run**. This creates the private `files` bucket (5 MB limit) and per-user security policies.
4. **Project Settings -> API**: copy the Project URL and the anon/publishable key into `supabase-config.js`.

## Run locally
ES modules do not work from `file://`, so use a local server:

    python -m http.server 8000

Open http://localhost:8000

## Security notes
- Only the anon/publishable key is used in the browser. Never use the service_role/secret key.
- The bucket is private. Policies let each user read, upload, and delete only inside `<their-user-id>/`.
- Downloads use short-lived (60 second) signed URLs.

## Free plan note
Free projects pause after about a week of inactivity. Resume the project from the dashboard before a demo.

## Features
Sign up / log in, upload with progress, file-type and size validation, file list with size and date, download, delete with confirmation, dashboard (file count and storage used), responsive layout.
