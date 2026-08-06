'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  DEFAULT_DEPARTMENTS,
  TEAM_PHOTO,
  checkPhotoFile,
  initials,
  normalisePhoto,
  sortDepartments,
  teamPhotoPath,
  type TeamMember,
} from '@/lib/team';

const BLANK = {
  name: '',
  role: '',
  department: 'Core',
  email: '',
  linkedin: '',
  instagram: '',
  sort_order: '100',
};

export default function TeamManager({ members }: { members: TeamMember[] }) {
  const router = useRouter();

  const [form, setForm] = useState({ ...BLANK });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const set = (k: keyof typeof BLANK, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Departments already in use, plus the defaults, so custom ones stick around.
  const departments = sortDepartments([
    ...new Set([...DEFAULT_DEPARTMENTS, ...members.map((m) => m.department)]),
  ]);

  function reset() {
    setForm({ ...BLANK });
    setEditingId(null);
    setPhoto(null);
    setError(null);
  }

  function startEdit(m: TeamMember) {
    setEditingId(m.id);
    setForm({
      name: m.name,
      role: m.role,
      department: m.department,
      email: m.email ?? '',
      linkedin: m.linkedin ?? '',
      instagram: m.instagram ?? '',
      sort_order: String(m.sort_order),
    });
    setPhoto(null);
    setError(null);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    setError(null);
    setNotice(null);

    if (form.name.trim().length < 2) return setError('Enter the member name.');
    if (form.role.trim().length < 2) return setError('Enter their role.');
    if (photo) {
      const fileError = checkPhotoFile(photo);
      if (fileError) return setError(fileError);
    }

    setBusy(true);
    const supabase = createClient();

    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        department: form.department.trim() || 'Core',
        email: form.email.trim() || null,
        linkedin: form.linkedin.trim() || null,
        instagram: form.instagram.trim() || null,
        sort_order: Number(form.sort_order) || 100,
      };

      let id = editingId;
      if (id) {
        const { error: e } = await supabase.from('team_members').update(payload).eq('id', id);
        if (e) throw e;
      } else {
        const { data, error: e } = await supabase
          .from('team_members')
          .insert(payload)
          .select('id')
          .single();
        if (e) throw e;
        id = data.id as string;
      }

      if (photo && id) {
        const blob = await normalisePhoto(photo);
        const path = teamPhotoPath(id);
        const up = await supabase.storage.from('posters').upload(path, blob, {
          upsert: true,
          contentType: 'image/webp',
          cacheControl: '3600',
        });
        if (up.error) throw up.error;

        const base = supabase.storage.from('posters').getPublicUrl(path).data.publicUrl;
        const { error: e } = await supabase
          .from('team_members')
          .update({ photo_url: `${base}?v=${Date.now()}` })
          .eq('id', id);
        if (e) throw e;
      }

      setNotice(editingId ? `Updated ${payload.name}.` : `Added ${payload.name}.`);
      reset();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save that member.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(m: TeamMember) {
    setBusy(true);
    await createClient().from('team_members').update({ is_active: !m.is_active }).eq('id', m.id);
    router.refresh();
    setBusy(false);
  }

  async function remove(m: TeamMember) {
    setBusy(true);
    const supabase = createClient();
    await supabase.storage.from('posters').remove([teamPhotoPath(m.id)]);
    const { error: e } = await supabase.from('team_members').delete().eq('id', m.id);
    if (e) setError(e.message);
    else setNotice(`Removed ${m.name}.`);
    router.refresh();
    setBusy(false);
  }

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()} className="panel p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-light text-white">
            {editingId ? 'Edit member' : 'Add a team member'}
          </h2>
          {editingId && (
            <button type="button" onClick={reset} className="text-xs text-slate-400 hover:text-white">
              Cancel edit
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="t-name">Name *</label>
            <input
              id="t-name"
              className="field"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Rahul Nayak"
            />
          </div>

          <div>
            <label className="label" htmlFor="t-role">Role *</label>
            <input
              id="t-role"
              className="field"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              placeholder="Convenor"
            />
          </div>

          <div>
            <label className="label" htmlFor="t-dept">Department *</label>
            <input
              id="t-dept"
              className="field"
              list="departments"
              value={form.department}
              onChange={(e) => set('department', e.target.value)}
            />
            <datalist id="departments">
              {departments.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
            <p className="hint">Pick one or type a new one. Departments group the public page.</p>
          </div>

          <div>
            <label className="label" htmlFor="t-order">Sort order</label>
            <input
              id="t-order"
              type="number"
              className="field"
              value={form.sort_order}
              onChange={(e) => set('sort_order', e.target.value)}
            />
            <p className="hint">Lower numbers appear first inside a department.</p>
          </div>

          <div>
            <label className="label" htmlFor="t-email">Email</label>
            <input
              id="t-email"
              type="email"
              className="field"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="t-linkedin">LinkedIn</label>
            <input
              id="t-linkedin"
              type="url"
              className="field"
              value={form.linkedin}
              onChange={(e) => set('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div>
            <label className="label" htmlFor="t-instagram">Instagram</label>
            <input
              id="t-instagram"
              className="field"
              value={form.instagram}
              onChange={(e) => set('instagram', e.target.value)}
              placeholder="@handle"
            />
          </div>

          <div>
            <label className="label" htmlFor="t-photo">Photo</label>
            <input
              id="t-photo"
              type="file"
              accept={TEAM_PHOTO.acceptAttr}
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="field file:mr-3 file: file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white"
            />
            <p className="hint">
              JPG, PNG or WebP, under {TEAM_PHOTO.maxBytes / 1024 / 1024} MB. Centre-cropped to a
              square at {TEAM_PHOTO.size}px.
              {editingId && ' Leave empty to keep the current photo.'}
            </p>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}
        {notice && !error && <p className="mt-2 text-xs font-medium text-emerald-400">{notice}</p>}

        <button type="button" onClick={save} disabled={busy} className="btn-primary mt-6">
          {busy ? 'Saving...' : editingId ? 'Save changes' : 'Add member'}
        </button>
      </form>

      <section className="mt-10">
        <h2 className="mb-4 font-display display-md">
          All members <span className="text-base font-medium text-slate-500">({members.length})</span>
        </h2>

        {members.length === 0 ? (
          <div className="panel p-12 text-center text-sm text-slate-400">
            No team members yet. The public team page shows an &ldquo;announced soon&rdquo; message
            until you add the first one.
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((m) => (
              <div key={m.id} className="panel flex flex-wrap items-center gap-4 p-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-ink-800">
                  {m.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-brand-400">{initials(m.name)}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{m.name}</p>
                  <p className="text-xs text-slate-500">
                    {m.role} · {m.department} · order {m.sort_order}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    m.is_active
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-slate-500/20 text-slate-400'
                  }`}
                >
                  {m.is_active ? 'Live' : 'Hidden'}
                </span>

                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(m)} className="btn-ghost !px-3 !py-1.5 text-xs">
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggleActive(m)}
                    className="btn-ghost !px-3 !py-1.5 text-xs"
                  >
                    {m.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove(m)}
                    className="btn-ghost !px-3 !py-1.5 text-xs text-rose-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
