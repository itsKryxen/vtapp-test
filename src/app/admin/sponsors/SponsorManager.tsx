'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  SPONSOR_LOGO,
  TIERS,
  checkSponsorLogoFile,
  normaliseSponsorLogo,
  sponsorLogoPath,
  type Sponsor,
  type SponsorTier,
} from '@/lib/sponsors';

const BLANK = {
  name: '',
  tier: 'partner' as SponsorTier,
  website: '',
  blurb: '',
  sort_order: '100',
};

export default function SponsorManager({ sponsors }: { sponsors: Sponsor[] }) {
  const router = useRouter();

  const [form, setForm] = useState({ ...BLANK });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const set = (k: keyof typeof BLANK, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function reset() {
    setForm({ ...BLANK });
    setEditingId(null);
    setLogoFile(null);
    setError(null);
  }

  function startEdit(s: Sponsor) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      tier: s.tier,
      website: s.website ?? '',
      blurb: s.blurb ?? '',
      sort_order: String(s.sort_order),
    });
    setLogoFile(null);
    setError(null);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    setError(null);
    setNotice(null);

    if (form.name.trim().length < 2) {
      setError('Enter the sponsor name.');
      return;
    }
    if (logoFile) {
      const fileError = checkSponsorLogoFile(logoFile);
      if (fileError) {
        setError(fileError);
        return;
      }
    }

    setBusy(true);
    const supabase = createClient();

    try {
      const payload = {
        name: form.name.trim(),
        tier: form.tier,
        website: form.website.trim() || null,
        blurb: form.blurb.trim() || null,
        sort_order: Number(form.sort_order) || 100,
      };

      // 1. upsert the row first so we have an id for the logo path
      let id = editingId;
      if (id) {
        const { error: e } = await supabase.from('sponsors').update(payload).eq('id', id);
        if (e) throw e;
      } else {
        const { data, error: e } = await supabase
          .from('sponsors')
          .insert(payload)
          .select('id')
          .single();
        if (e) throw e;
        id = data.id as string;
      }

      // 2. logo, fitted to 600×300 on a transparent canvas
      if (logoFile && id) {
        const blob = await normaliseSponsorLogo(logoFile);
        const path = sponsorLogoPath(id);
        const up = await supabase.storage.from('posters').upload(path, blob, {
          upsert: true,
          contentType: 'image/webp',
          cacheControl: '3600',
        });
        if (up.error) throw up.error;

        const base = supabase.storage.from('posters').getPublicUrl(path).data.publicUrl;
        const { error: e } = await supabase
          .from('sponsors')
          .update({ logo_url: `${base}?v=${Date.now()}` })
          .eq('id', id);
        if (e) throw e;
      }

      setNotice(editingId ? `Updated ${payload.name}.` : `Added ${payload.name}.`);
      reset();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save that sponsor.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(s: Sponsor) {
    setBusy(true);
    await createClient().from('sponsors').update({ is_active: !s.is_active }).eq('id', s.id);
    router.refresh();
    setBusy(false);
  }

  async function remove(s: Sponsor) {
    setBusy(true);
    const supabase = createClient();
    await supabase.storage.from('posters').remove([sponsorLogoPath(s.id)]);
    const { error: e } = await supabase.from('sponsors').delete().eq('id', s.id);
    if (e) setError(e.message);
    else setNotice(`Removed ${s.name}.`);
    router.refresh();
    setBusy(false);
  }

  return (
    <>
      {/* ------------------------------- add / edit ------------------------------- */}
      <form onSubmit={(e) => e.preventDefault()} className="panel p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-light text-white">
            {editingId ? 'Edit sponsor' : 'Add a sponsor'}
          </h2>
          {editingId && (
            <button type="button" onClick={reset} className="text-xs text-slate-400 hover:text-white">
              Cancel edit
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="s-name">Sponsor name *</label>
            <input
              id="s-name"
              className="field"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Acme Technologies"
            />
          </div>

          <div>
            <label className="label" htmlFor="s-tier">Tier *</label>
            <select
              id="s-tier"
              className="field"
              value={form.tier}
              onChange={(e) => set('tier', e.target.value)}
            >
              {TIERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="s-website">Website</label>
            <input
              id="s-website"
              type="url"
              className="field"
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
              placeholder="https://acme.com"
            />
          </div>

          <div>
            <label className="label" htmlFor="s-order">Sort order</label>
            <input
              id="s-order"
              type="number"
              className="field"
              value={form.sort_order}
              onChange={(e) => set('sort_order', e.target.value)}
            />
            <p className="hint">Lower numbers appear first within a tier.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="s-blurb">Blurb</label>
            <input
              id="s-blurb"
              className="field"
              value={form.blurb}
              maxLength={240}
              onChange={(e) => set('blurb', e.target.value)}
              placeholder="One line about the sponsor, shown under the title sponsor only."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="s-logo">Logo</label>
            <input
              id="s-logo"
              type="file"
              accept={SPONSOR_LOGO.acceptAttr}
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className="field file:mr-3 file: file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white"
            />
            <p className="hint">
              PNG, JPG, WebP or SVG · under {SPONSOR_LOGO.maxBytes / 1024 / 1024} MB. Fitted inside{' '}
              {SPONSOR_LOGO.boxWidth}×{SPONSOR_LOGO.boxHeight} without cropping, so any shape works.
              A transparent PNG looks best on the dark background.
              {editingId && ' Leave empty to keep the current logo.'}
            </p>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}
        {notice && !error && <p className="mt-2 text-xs font-medium text-emerald-400">{notice}</p>}

        <button type="button" onClick={save} disabled={busy} className="btn-primary mt-6">
          {busy ? 'Saving…' : editingId ? 'Save changes' : 'Add sponsor'}
        </button>
      </form>

      {/* --------------------------------- list --------------------------------- */}
      <section className="mt-10">
        <h2 className="mb-4 font-display display-md">
          All sponsors <span className="text-base font-medium text-slate-500">({sponsors.length})</span>
        </h2>

        {sponsors.length === 0 ? (
          <div className="panel p-12 text-center text-sm text-slate-400">
            No sponsors yet. The public sponsors page shows a &ldquo;coming soon&rdquo; message and
            the homepage strip stays hidden until you add the first one.
          </div>
        ) : (
          <div className="space-y-3">
            {sponsors.map((s) => {
              const tier = TIERS.find((t) => t.value === s.tier);
              return (
                <div key={s.id} className="panel flex flex-wrap items-center gap-4 p-4">
                  <div className="grid h-12 w-24 shrink-0 place-items-center overflow-hidden bg-ink-800">
                    {s.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logo_url} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-slate-600">no logo</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      {tier?.label ?? s.tier} · order {s.sort_order}
                      {s.website ? ` · ${s.website.replace(/^https?:\/\//, '')}` : ''}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      s.is_active
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}
                  >
                    {s.is_active ? 'Live' : 'Hidden'}
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(s)}
                      className="btn-ghost !px-3 !py-1.5 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => toggleActive(s)}
                      className="btn-ghost !px-3 !py-1.5 text-xs"
                    >
                      {s.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(s)}
                      className="btn-ghost !px-3 !py-1.5 text-xs text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
