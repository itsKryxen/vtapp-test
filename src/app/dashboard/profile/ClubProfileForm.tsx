'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ClubLogoUploader, { type LogoPayload } from '@/components/ClubLogoUploader';
import { createClient } from '@/lib/supabase/client';
import { clubLogoPath } from '@/lib/clubLogo';
import type { Club } from '@/lib/types';

export default function ClubProfileForm({ club }: { club: Club }) {
  const router = useRouter();

  const [tagline, setTagline] = useState(club.tagline ?? '');
  const [contactName, setContactName] = useState(club.contact_name ?? '');
  const [contactPhone, setContactPhone] = useState(club.contact_phone ?? '');
  const [instagram, setInstagram] = useState(club.instagram ?? '');

  const [logo, setLogo] = useState<LogoPayload | null>(null);
  const [logoCleared, setLogoCleared] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);

    try {
      const supabase = createClient();
      let logoUrl: string | null = null; // null = leave untouched

      if (logo) {
        const path = clubLogoPath(club.id);
        const up = await supabase.storage
          .from('posters')
          .upload(path, logo.blob, {
            upsert: true,
            contentType: 'image/webp',
            cacheControl: '3600',
          });
        if (up.error) throw up.error;

        // cache-bust so a replaced logo shows immediately
        const base = supabase.storage.from('posters').getPublicUrl(path).data.publicUrl;
        logoUrl = `${base}?v=${Date.now()}`;
      } else if (logoCleared) {
        logoUrl = ''; // '' tells the RPC to clear the column
      }

      const { error: rpcError } = await supabase.rpc('update_club_profile', {
        p_tagline: tagline,
        p_logo_url: logoUrl,
        p_contact_name: contactName,
        p_contact_phone: contactPhone,
        p_instagram: instagram,
      });
      if (rpcError) throw rpcError;

      setSaved(true);
      setLogoCleared(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <section className="panel p-6">
        <h2 className="font-display text-lg font-light text-white">Identity</h2>
        <p className="mt-1 text-xs text-slate-500">
          Shown on the public clubs directory and next to every event you host.
        </p>

        <div className="mt-5 space-y-5">
          <ClubLogoUploader
            initialUrl={club.logo_url}
            onChange={(payload) => {
              setLogo(payload);
              if (payload) setLogoCleared(false);
            }}
            onClear={() => setLogoCleared(true)}
          />

          <div>
            <label className="label" htmlFor="tagline">
              Tagline
            </label>
            <input
              id="tagline"
              className="field"
              value={tagline}
              maxLength={120}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Build with Google tech"
            />
            <p className="hint">One line, max 120 characters. What your club is about.</p>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="font-display text-lg font-light text-white">Contact</h2>
        <p className="mt-1 text-xs text-slate-500">
          How the core team reaches you. Your login email is fixed, so email the core team to change
          it.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="contact_name">
              Club lead
            </label>
            <input
              id="contact_name"
              className="field"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="contact_phone">
              Phone
            </label>
            <input
              id="contact_phone"
              className="field"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 90000 00000"
            />
          </div>

          <div>
            <label className="label" htmlFor="instagram">
              Instagram
            </label>
            <input
              id="instagram"
              className="field"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@clubhandle"
            />
          </div>

          <div>
            <label className="label">Login email</label>
            <input className="field opacity-60" value={club.contact_email} disabled readOnly />
          </div>
        </div>
      </section>

      {error && (
        <p className="border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Profile saved. Your logo is live on the clubs directory.
        </p>
      )}

      <button type="button" onClick={save} disabled={busy} className="btn-primary">
        {busy ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
