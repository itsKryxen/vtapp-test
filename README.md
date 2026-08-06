# V-TAPP 2026

The techfest site for VIT-AP, with a club portal where club members upload their own events, a sponsor and team directory, and ticketing.

Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (auth + Postgres + storage).

---

## Run it

You need **Node 18.17+** and a free **Supabase** project.

```bash
cd vtapp-2026
npm install
npm run dev
```

Open <http://localhost:3000>.

Out of the box, with no database, the site fills itself with demo content so you can see the finished design immediately. Everything below is for making it real.

> Use `npm run dev` for development. `npm run build` is only for producing a production bundle before deploying.

### 1. Database

Create a project at [supabase.com](https://supabase.com), pick a region close to India, then open **SQL Editor → New query**, paste the whole of **`supabase/vtapp-2026-complete.sql`**, and run it.

That one file is everything: tables, functions, row-level security, storage policies and the seven VIT-AP schools. It is idempotent, so it is safe to run twice and safe to re-run after editing. The individual files in `supabase/migrations/` are kept for reference but you do not need them.

### 2. Keys

```bash
cp .env.example .env.local
```

Fill in from **Supabase → Project Settings → API**:

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key, safe in the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** Bypasses all security. Never commit it. Only `/admin/clubs` needs it. |
| `NEXT_PUBLIC_PAYMENT_PORTAL` | Defaults to `https://events.vitap.ac.in` |
| `NEXT_PUBLIC_SHOW_DEMO_EVENTS` | `true` forces demo content, `false` forces real data, unset means demo only while Supabase is unconfigured |

Restart the dev server: environment changes are read at startup, not hot-reloaded.

### 3. Your admin login

There is no public signup page. Accounts exist only because someone issues them, so the first admin is made by hand, once:

1. Supabase → **Authentication → Users → Add user**. Your email, a password, tick auto-confirm.
2. Copy that user's UUID.
3. SQL Editor:

```sql
insert into public.club_members (user_id, club_id, role, full_name)
values ('paste-the-uuid', null, 'admin', 'Rahul');
```

`club_id` is null because an admin is not attached to a club. Now sign in at `/login`; the admin panel is at `/admin`.

From then on, issue club accounts from `/admin/clubs` in the browser. It allocates the ID, creates the login, links them, and shows the generated password **once**.

---

## Routes

| Route | Who | What |
|---|---|---|
| `/` | public | hero, featured events, sponsor strip |
| `/events` · `/events/[slug]` | public | listing with search and category filters, full event pages |
| `/schedule` | public | two-day running order |
| `/clubs` | public | searchable club directory with logos |
| `/sponsors` | public | tiered sponsor wall |
| `/team` | public | core team by department |
| `/tickets` | public | combo pass and per-event tickets |
| `/tickets/return` | public | landing point after payment |
| `/tickets/status` | public | order lookup by reference |
| `/poster-guidelines` | unlisted | the poster spec, send clubs this link |
| `/login` | unlisted | club ID or email |
| `/dashboard` | club | their events, drafts and review status |
| `/dashboard/events/new` | club | submission form |
| `/dashboard/profile` | club | logo, tagline, contact |
| `/admin` | admin | review queue |
| `/admin/clubs` · `/admin/sponsors` · `/admin/team` | admin | issue IDs, manage sponsors and team |

Club and admin routes are deliberately unlinked from the public site. Send clubs the `/login` URL directly.

---

## Design system

Dark by default, with a light mode that is a **straight inversion**: white where dark mode is black, black where dark mode is white, crimson constant in both.

| | Dark | Light |
|---|---|---|
| Page | `#08080A` | `#FFFFFF` |
| Ink | white | black |
| Accent | `#B32821` | `#B32821` |

Theming works through CSS variables holding raw `R G B` channels, mapped onto Tailwind's palette. The same class names invert: `text-white` resolves to black in light mode, `bg-ink-950` to white, and `border-white/10` hairlines flip with them. There are no `dark:` variants anywhere in the markup.

Two exceptions, both deliberate. `.on-media` re-pins the dark token set locally, used anywhere content sits on poster or photo artwork so captions stay light-on-dark in both themes. `.on-brand` forces literal white for text on a crimson fill.

**Type.** Inter at 200 and 300 for display, set large with tight negative tracking. JetBrains Mono for every label, tag, nav item, button and readout. Light weight at large size is what reads as engineered rather than loud.

**Geometry.** Zero radius, hairline borders, no blur or glass. Card grids are built from `gap-px` over a background, so the dividers are the borders.

Colour and spacing tokens live in `tailwind.config.ts`; component classes and both theme blocks live in `src/app/globals.css`.

---

## Club IDs

```
VT26_SCOPE_001
└┬─┘ └─┬─┘ └┬┘
 │     │    └── 3 digits, zero-padded, unique WITHIN the school, starts at 001
 │     └─────── school code
 └───────────── fest prefix
```

Schools: `SCOPE` `SENSE` `SMEC` `SAS` `VSB` `VSL` `VISH` `CENTRAL`

The index is per school, so `VT26_SCOPE_001` and `VT26_SENSE_001` both exist. IDs are allocated atomically by `issue_club_id()`, so two admins issuing at once cannot collide. A club ID is permanent: it is the login identifier, the foreign key on every event, and the first folder in that club's storage path. Event codes derive from it as `VT26_SCOPE_001-E01`.

---

## Posters

One canonical size for the whole fest.

| | |
|---|---|
| Poster | **1080 × 1350 px** (4:5 portrait) |
| Thumbnail | 540 × 675 WebP, generated in the browser |
| Formats | JPG, PNG, WebP, under 5 MB |

Validation runs before anything uploads: wrong ratio is rejected outright, right-ratio-wrong-size is resized automatically. Files land at `posters/<CLUB_ID>/<EVENT_CODE>/`, and storage security scopes writes to the club's own folder, so one club physically cannot overwrite another's poster.

To change the size, edit `src/lib/poster.ts`. The uploader, cards and guidelines page all read from that one file. The public spec is at `/poster-guidelines`.

---

## Ticketing

Combo pass at ₹500 covering every event, or per-event tickets priced from each event's own fee.

```
pick → pending order created → reference VT26-A7K3QX
     → events.vitap.ac.in     → redirect back to /tickets/return
     → outcome recorded       → receipt
```

Three things worth knowing:

**Prices are computed in the database.** `create_ticket_order` reads each event's real fee and takes the combo rate from config. Nothing about the amount comes from the browser.

**There is no direct table access.** `ticket_orders` has row-level security with only an admin policy; every operation goes through a security-definer function, and lookup returns exactly one row by exact reference.

**A URL parameter is not proof of payment.** Paid orders are stored with `verified = false` and the receipt says so plainly. Reconcile against the portal's records, then flip `verified` in Supabase. `complete_ticket_order` only ever moves an order out of pending, so a reference cannot be replayed to flip a settled order.

Confirm the parameter names with whoever runs the portal. We send `ref`, `amount`, `currency`, `event`, `type` and `return_url`, and accept several spellings of success on the way back. Adjusting that is a small change in `src/lib/tickets.ts`.

---

## Event workflow

```
club fills form → draft (private, editable)
      ↓ submit
                → submitted (in the admin queue)
      ↓ approve                  ↓ request changes
                → approved       → rejected (club sees the note, edits, resubmits)
                   (live)
```

Approved events are locked to the club so the public listing stays stable for anyone who has already registered. Only an admin can reopen one.

---

## Editing content

| What | Where |
|---|---|
| Dates, tagline, deadline, contact | `src/lib/fest.ts` |
| Schools and accent colours | `src/lib/schools.ts` |
| Poster dimensions | `src/lib/poster.ts` |
| Club ID format | `src/lib/clubId.ts` |
| Event categories | `src/lib/types.ts` |
| Combo price, portal URL | `src/lib/tickets.ts` |
| Sponsor tiers | `src/lib/sponsors.ts` |
| Demo content | `src/lib/demo.ts`, `src/lib/sample-events.ts` |
| Colours, type, components | `tailwind.config.ts`, `src/app/globals.css` |

Adding an event category means adding a matching icon path to `src/components/Icon3D.tsx`, or the icon silently renders nothing.

---

## Assets

| File | Use |
|---|---|
| `public/vtapp-logo-transparent.png` | horizontal lockup, hero and footer |
| `public/vtapp-mark-transparent.png` | square mark, navbar |
| `src/app/icon.png` · `apple-icon.png` | favicon and iOS icon |
| `public/og.png` | social share card |
| `public/demo/` | generated demo posters and logos |

Replacing the logo means swapping those files at the same dimensions. Nothing hardcodes the artwork beyond `src/components/Logo.tsx`.

---

## Deploy

Push to GitHub, import into [Vercel](https://vercel.com), add the same environment variables, deploy. For `vtapp.vitap.ac.in`, add the domain in Vercel and ask VIT-AP IT to point a CNAME at `cname.vercel-dns.com`.

Set `NEXT_PUBLIC_SHOW_DEMO_EVENTS=false` in production so demo content can never appear on the live site.

---

## Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint
```
# VTAAP-2026
