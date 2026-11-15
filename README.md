# Dianita's Shop by DJ's

A bilingual (English/Spanish) static website for a custom creations shop, with a Supabase-backed order intake system and private order dashboard.

## Stack
- HTML, CSS, and vanilla JavaScript
- Supabase PostgreSQL database
- Supabase private Storage for customer reference images
- Supabase Auth for the shop-owner dashboard
- GitHub Pages for static website hosting

## Architecture
- `index.html` is the customer-facing shop.
- `order-form.js` validates the form, optionally uploads a reference image, and inserts the order.
- `supabase-schema.sql` creates the orders table, private image bucket, and Row Level Security (RLS) policies.
- `admin.html` and `admin.js` provide a sign-in protected order dashboard.
- `supabase-config.js` contains the project URL and public anon/publishable key.

## Supabase setup (required before launch)

1. Create a Supabase project at https://supabase.com/.
2. In Project Settings / API, copy the project URL and public anon/publishable key into `supabase-config.js`.
   - The anon/publishable key is designed for browser use when RLS is correctly configured.
   - **Never put a service_role key, database password, or other secret in this repository.**
3. Create the shop owner's Auth user in Supabase Authentication. Use an individual account with a strong password and enable MFA if available.
4. Open Supabase SQL Editor. In `supabase-schema.sql`, replace `REPLACE_WITH_SHOP_ADMIN_EMAIL` with the exact email address of that Auth user. Run the full SQL script.
5. Confirm the `order-references` Storage bucket is private and the RLS policies were created.
6. Test the admin login at `admin.html`.
7. Submit test orders from a separate browser/incognito session. Verify a visitor cannot read the orders table or private files, and the signed-in shop admin can.

## Customer order flow
- Customers submit name, email, item type, optional design notes, and an optional image.
- Reference images are limited in the interface to image files up to 8 MB. Supabase Storage further restricts the bucket to JPEG, PNG, WebP, and GIF up to 8 MB.
- Orders are stored with status `pending`.
- The shop owner signs in at `admin.html`, reviews orders, opens time-limited signed image links, and updates order status.
- The customer form does not calculate a binding quote. The starting-price display is informational only; confirm actual prices with the shop owner.

## Security notes and launch checklist
- Keep RLS enabled. Public visitors should have insert-only access to orders and upload-only access to the private reference-image bucket. They must not be able to read customer records or images.
- The admin SQL policy restricts order and image reads to the configured Auth user's email. Do not change this to a broad authenticated-user policy.
- Only the public anon/publishable key belongs in `supabase-config.js`. Never commit a service-role key.
- This starter currently has no CAPTCHA or rate limiting. Before public launch, add abuse protection (for example, a CAPTCHA verified by a server-side/Edge Function) and monitor storage usage.
- Test mobile and desktop form submission, image upload, admin sign-in, status changes, and private image access before launch.
- The original live `main` branch is unchanged; this work is on `feature/whatsapp-order-form` pending review and Supabase configuration.
