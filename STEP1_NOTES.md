# Step 1 – API Contract Notes (PR Description)

## 5-Bullet Summary

- **Upload endpoint:** `POST /api/v1/media/` (proxied via `POST /api/backend/media/`). Body is `multipart/form-data` with two required fields: `file` (the binary) and `project_id` (integer). Auth via `X-Api-Key` header. No MIME restriction enforced at schema level; max file size not documented — server returns `413` if exceeded.

- **Upload response shape:** `{ success, message, data: [{ id, url, original_filename, file_size, file_size_human, mime_type, file_type, file_type_display, width, height, title, alt_text, tags, created_at }] }`. Files are stored on Cloudflare R2 (`*.r2.dev`). The `url` field is the direct public URL.

- **No signed-URL / download endpoint:** There is no separate download route. The `url` field returned on upload is the permanent direct link. Downloads go through the public R2 URL — no auth needed to fetch the file itself.

- **Error format:** `{ success: false, message: "<reason>", data: null }`. HTTP status matches the error type (400 for bad input, 413 for oversized file, 500 for server error).

- **Field registry:** Blank slate — no existing registry. Custom model field types available from the API: `text`, `textarea`, `rich_text`, `number`, `boolean`, `date`, `datetime`, `url`, `email`, `image`, `multi_image`, `file`, `json`, `select`, `multiselect`. File values in form payloads serialize as the media record's UUID `id` inside the instance `data` object (e.g. `{ data: { my_field: "a1f18a9f-..." } }`).

## App Status
- Runs at `http://localhost:3001` (port 3000 was in use). `npm run dev` starts in ~2s via Turbopack.
- Home page loads: "File Portal — Clean slate for Part 1."
