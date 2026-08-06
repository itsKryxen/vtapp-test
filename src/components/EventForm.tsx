'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PosterUploader, { type PosterPayload } from './PosterUploader';
import { createClient } from '@/lib/supabase/client';
import { posterPath, thumbnailPath } from '@/lib/clubId';
import { CATEGORIES, type EventRecord } from '@/lib/types';

interface Props {
  clubId: string;
  /** Present when editing an existing event. */
  event?: EventRecord;
}

type FormState = {
  title: string;
  tagline: string;
  description: string;
  rules: string;
  category: string;
  start_at: string;
  end_at: string;
  venue: string;
  team_type: string;
  team_min: string;
  team_max: string;
  max_participants: string;
  registration_fee: string;
  registration_url: string;
  registration_deadline: string;
  prize_pool: string;
  prizes: string;
  coordinator_name: string;
  coordinator_phone: string;
  coordinator_email: string;
};

/** ISO -> value accepted by <input type="datetime-local"> in local time. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export default function EventForm({ clubId, event }: Props) {
  const router = useRouter();
  const isEdit = Boolean(event);

  const [form, setForm] = useState<FormState>({
    title: event?.title ?? '',
    tagline: event?.tagline ?? '',
    description: event?.description ?? '',
    rules: event?.rules ?? '',
    category: event?.category ?? 'technical',
    start_at: toLocalInput(event?.start_at),
    end_at: toLocalInput(event?.end_at),
    venue: event?.venue ?? '',
    team_type: event?.team_type ?? 'solo',
    team_min: String(event?.team_min ?? 1),
    team_max: String(event?.team_max ?? 1),
    max_participants: event?.max_participants ? String(event.max_participants) : '',
    registration_fee: String(event?.registration_fee ?? 0),
    registration_url: event?.registration_url ?? '',
    registration_deadline: toLocalInput(event?.registration_deadline),
    prize_pool: event?.prize_pool ? String(event.prize_pool) : '',
    prizes: event?.prizes ?? '',
    coordinator_name: event?.coordinator_name ?? '',
    coordinator_phone: event?.coordinator_phone ?? '',
    coordinator_email: event?.coordinator_email ?? '',
  });

  const [poster, setPoster] = useState<PosterPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<false | 'draft' | 'submit'>(false);
  const [progress, setProgress] = useState('');

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const hasPoster = Boolean(poster) || Boolean(event?.poster_url);

  function validate(intent: 'draft' | 'submit'): string | null {
    if (!form.title.trim() || form.title.trim().length < 3) return 'Give the event a title.';
    if (intent === 'draft') return null;

    if (form.description.trim().length < 40)
      return 'The description must be at least 40 characters. Tell participants what actually happens.';
    if (!form.start_at || !form.end_at) return 'Set both a start and an end time.';
    if (new Date(form.end_at) <= new Date(form.start_at)) return 'The end time must be after the start time.';
    if (!form.venue.trim()) return 'Add a venue (or "Online · Discord" for online events).';
    if (!form.coordinator_name.trim()) return 'Add a coordinator name.';
    if (!/^[0-9+ ()-]{8,20}$/.test(form.coordinator_phone))
      return 'Add a valid coordinator phone number.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.coordinator_email))
      return 'Add a valid coordinator email.';
    if (Number(form.team_max) < Number(form.team_min))
      return 'Maximum team size cannot be smaller than the minimum.';
    if (!hasPoster) return 'Upload the event poster before submitting for review.';
    return null;
  }

  function payload(status: 'draft' | 'submitted') {
    return {
      club_id: clubId,
      title: form.title.trim(),
      tagline: form.tagline.trim() || null,
      description: form.description.trim(),
      rules: form.rules.trim() || null,
      category: form.category,
      mode: 'offline',
      start_at: form.start_at ? new Date(form.start_at).toISOString() : null,
      end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
      venue: form.venue.trim(),
      team_type: form.team_type,
      team_min: Number(form.team_min) || 1,
      team_max: Number(form.team_max) || 1,
      max_participants: form.max_participants ? Number(form.max_participants) : null,
      registration_fee: Number(form.registration_fee) || 0,
      registration_url: form.registration_url.trim() || null,
      registration_deadline: form.registration_deadline
        ? new Date(form.registration_deadline).toISOString()
        : null,
      prize_pool: form.prize_pool ? Number(form.prize_pool) : null,
      prizes: form.prizes.trim() || null,
      coordinator_name: form.coordinator_name.trim(),
      coordinator_phone: form.coordinator_phone.trim(),
      coordinator_email: form.coordinator_email.trim(),
      status,
    };
  }

  async function save(intent: 'draft' | 'submit') {
    setError(null);
    const problem = validate(intent);
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(intent);
    const supabase = createClient();

    try {
      const status = intent === 'submit' ? 'submitted' : 'draft';

      // 1. Write the row as a draft first so the DB assigns the event_code
      //    (VT26_SCOPE_001-E01) that the poster path is built from.
      setProgress('Saving event…');
      let row: EventRecord;

      if (isEdit && event) {
        const { data, error: e } = await supabase
          .from('events')
          .update({ ...payload('draft') })
          .eq('id', event.id)
          .select()
          .single();
        if (e) throw e;
        row = data as EventRecord;
      } else {
        const { data, error: e } = await supabase
          .from('events')
          .insert({ ...payload('draft') })
          .select()
          .single();
        if (e) throw e;
        row = data as EventRecord;
      }

      // 2. Upload poster + thumbnail under posters/<CLUB_ID>/<EVENT_CODE>/
      let posterUrl = row.poster_url;
      let thumbUrl = row.thumbnail_url;

      if (poster) {
        setProgress('Uploading poster…');
        const pPath = posterPath(clubId, row.event_code, poster.ext);
        const tPath = thumbnailPath(clubId, row.event_code);

        const contentType =
          poster.ext === 'png' ? 'image/png' : poster.ext === 'webp' ? 'image/webp' : 'image/jpeg';

        const up1 = await supabase.storage
          .from('posters')
          .upload(pPath, poster.poster, { upsert: true, contentType, cacheControl: '3600' });
        if (up1.error) throw up1.error;

        const up2 = await supabase.storage
          .from('posters')
          .upload(tPath, poster.thumbnail, {
            upsert: true,
            contentType: 'image/webp',
            cacheControl: '3600',
          });
        if (up2.error) throw up2.error;

        posterUrl = supabase.storage.from('posters').getPublicUrl(pPath).data.publicUrl;
        thumbUrl = supabase.storage.from('posters').getPublicUrl(tPath).data.publicUrl;
      }

      // 3. Final update: attach poster URLs and set the real status.
      setProgress(intent === 'submit' ? 'Submitting for review…' : 'Saving draft…');
      const { error: finalError } = await supabase
        .from('events')
        .update({ poster_url: posterUrl, thumbnail_url: thumbUrl, status })
        .eq('id', row.id);
      if (finalError) throw finalError;

      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : 'Save failed.';
      setError(message);
    } finally {
      setBusy(false);
      setProgress('');
    }
  }

  const showTeamSizes = form.team_type !== 'solo';

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
      {/* ---------------- basics ---------------- */}
      <Section title="The basics" hint="This is what shows on the event card.">
        <Field label="Event title" required span2>
          <input
            className="field"
            value={form.title}
            maxLength={80}
            onChange={(e) => set('title', e.target.value)}
            placeholder="HackaVerse"
          />
        </Field>

        <Field label="One-line tagline" span2 hint="Shown under the title on the card. Max 120 characters.">
          <input
            className="field"
            value={form.tagline}
            maxLength={120}
            onChange={(e) => set('tagline', e.target.value)}
            placeholder="24 hours. One problem statement. Zero sleep."
          />
        </Field>

        <Field label="Category" required span2>
          <select className="field" value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Description"
          required
          span2
          hint={`${form.description.length}/4000 characters · minimum 40. One blank line between paragraphs.`}
        >
          <textarea
            className="field min-h-[150px] resize-y"
            value={form.description}
            maxLength={4000}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What happens, who it is for, what participants should bring…"
          />
        </Field>

        <Field label="Rules" span2 hint="One rule per line. Rendered as a bulleted list.">
          <textarea
            className="field min-h-[110px] resize-y"
            value={form.rules}
            maxLength={4000}
            onChange={(e) => set('rules', e.target.value)}
            placeholder={'Teams of 2 to 4 only\nLaptops and chargers are your responsibility\nCode must be written during the event'}
          />
        </Field>
      </Section>

      {/* ---------------- poster ---------------- */}
      <Section
        title="Poster"
        hint="One canonical size across the whole fest: 1080 × 1350 px, 4:5 portrait."
      >
        <div className="sm:col-span-2">
          <PosterUploader onChange={setPoster} initialUrl={event?.thumbnail_url ?? null} />
        </div>
      </Section>

      {/* ---------------- when and where ---------------- */}
      <Section title="When and where">
        <Field label="Starts" required>
          <input
            type="datetime-local"
            className="field"
            value={form.start_at}
            onChange={(e) => set('start_at', e.target.value)}
          />
        </Field>

        <Field label="Ends" required>
          <input
            type="datetime-local"
            className="field"
            value={form.end_at}
            onChange={(e) => set('end_at', e.target.value)}
          />
        </Field>

        <Field label="Venue" required span2 hint='Room / block, or "Online · Discord" for online events.'>
          <input
            className="field"
            value={form.venue}
            onChange={(e) => set('venue', e.target.value)}
            placeholder="AB-1 Central Lab"
          />
        </Field>
      </Section>

      {/* ---------------- participation ---------------- */}
      <Section title="Participation">
        <Field label="Entry type" required>
          <select
            className="field"
            value={form.team_type}
            onChange={(e) => {
              const v = e.target.value;
              set('team_type', v);
              if (v === 'solo') {
                set('team_min', '1');
                set('team_max', '1');
              }
            }}
          >
            <option value="solo">Solo only</option>
            <option value="team">Teams only</option>
            <option value="both">Solo or team</option>
          </select>
        </Field>

        <Field label="Registration fee (₹)" hint="0 for a free event.">
          <input
            type="number"
            min={0}
            className="field"
            value={form.registration_fee}
            onChange={(e) => set('registration_fee', e.target.value)}
          />
        </Field>

        {showTeamSizes && (
          <>
            <Field label="Min team size">
              <input
                type="number"
                min={1}
                className="field"
                value={form.team_min}
                onChange={(e) => set('team_min', e.target.value)}
              />
            </Field>
            <Field label="Max team size">
              <input
                type="number"
                min={1}
                className="field"
                value={form.team_max}
                onChange={(e) => set('team_max', e.target.value)}
              />
            </Field>
          </>
        )}

        <Field label="Seat cap" hint="Leave blank for unlimited.">
          <input
            type="number"
            min={1}
            className="field"
            value={form.max_participants}
            onChange={(e) => set('max_participants', e.target.value)}
            placeholder="120"
          />
        </Field>

        <Field label="Registration closes">
          <input
            type="datetime-local"
            className="field"
            value={form.registration_deadline}
            onChange={(e) => set('registration_deadline', e.target.value)}
          />
        </Field>

        <Field
          label="Registration link"
          span2
          hint="Google Form, Unstop, Devfolio, wherever participants sign up."
        >
          <input
            type="url"
            className="field"
            value={form.registration_url}
            onChange={(e) => set('registration_url', e.target.value)}
            placeholder="https://forms.gle/…"
          />
        </Field>
      </Section>

      {/* ---------------- prizes ---------------- */}
      <Section title="Prizes" hint="Optional. Leave blank for workshops and talks.">
        <Field label="Total prize pool (₹)">
          <input
            type="number"
            min={0}
            className="field"
            value={form.prize_pool}
            onChange={(e) => set('prize_pool', e.target.value)}
            placeholder="50000"
          />
        </Field>

        <Field label="Prize breakdown">
          <input
            className="field"
            value={form.prizes}
            onChange={(e) => set('prizes', e.target.value)}
            placeholder="1st ₹25,000 · 2nd ₹15,000 · 3rd ₹10,000"
          />
        </Field>
      </Section>

      {/* ---------------- contact ---------------- */}
      <Section title="Event coordinator" hint="Published on the event page so participants can reach you.">
        <Field label="Name" required>
          <input
            className="field"
            value={form.coordinator_name}
            onChange={(e) => set('coordinator_name', e.target.value)}
          />
        </Field>

        <Field label="Phone" required>
          <input
            className="field"
            value={form.coordinator_phone}
            onChange={(e) => set('coordinator_phone', e.target.value)}
            placeholder="+91 90000 00000"
          />
        </Field>

        <Field label="Email" required span2>
          <input
            type="email"
            className="field"
            value={form.coordinator_email}
            onChange={(e) => set('coordinator_email', e.target.value)}
            placeholder="you@vitap.ac.in"
          />
        </Field>
      </Section>

      {/* ---------------- actions ---------------- */}
      {error && (
        <p className="border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-3 border border-white/15 bg-ink-900 p-4">
        <button
          type="button"
          onClick={() => save('submit')}
          disabled={busy !== false}
          className="btn-primary"
        >
          {busy === 'submit' ? progress || 'Submitting…' : 'Submit for review'}
        </button>
        <button
          type="button"
          onClick={() => save('draft')}
          disabled={busy !== false}
          className="btn-ghost"
        >
          {busy === 'draft' ? progress || 'Saving…' : 'Save draft'}
        </button>
        <p className="text-xs text-slate-500">
          Drafts are private. Once submitted, the core team reviews and publishes it.
        </p>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------- layout ---- */

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel p-6">
      <h2 className="font-display text-lg font-light text-white">{title}</h2>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  required,
  hint,
  span2,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? 'sm:col-span-2' : undefined}>
      <label className="label">
        {label} {required && <span className="text-brand-500">*</span>}
      </label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
