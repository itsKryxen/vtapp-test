'use client';

import { useCallback, useRef, useState } from 'react';
import {
  CLUB_LOGO,
  checkLogoDimensions,
  checkLogoFile,
  loadLogo,
  normaliseLogo,
  type LogoCheck,
} from '@/lib/clubLogo';

export interface LogoPayload {
  blob: Blob;
  previewUrl: string;
}

interface Props {
  onChange: (payload: LogoPayload | null) => void;
  /** Existing logo URL, shown until a new file is picked. */
  initialUrl?: string | null;
  /** Called when the club clears an existing logo. */
  onClear?: () => void;
}

export default function ClubLogoUploader({ onChange, initialUrl = null, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [check, setCheck] = useState<LogoCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setCheck(null);
      setBusy(true);

      try {
        const fileError = checkLogoFile(file);
        if (fileError) {
          setError(fileError);
          onChange(null);
          return;
        }

        // SVG has no intrinsic pixel size worth checking, rasterise and go.
        if (file.type !== 'image/svg+xml') {
          const img = await loadLogo(file);
          const result = checkLogoDimensions(img.width, img.height);
          setCheck(result);
          if (!result.ok) {
            setError(result.message);
            onChange(null);
            return;
          }
        }

        const blob = await normaliseLogo(file);
        const previewUrl = URL.createObjectURL(blob);
        setPreview(previewUrl);
        onChange({ blob, previewUrl });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong reading that image.');
        onChange(null);
      } finally {
        setBusy(false);
      }
    },
    [onChange]
  );

  return (
    <div>
      <label className="label" htmlFor="club-logo-input">
        Club logo
      </label>

      <div className="flex items-center gap-5">
        {/* preview well, round, like it renders on the directory */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden border border-white/10 bg-ink-800">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Club logo preview" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-[10px] text-slate-600">
              no logo
            </div>
          )}
          {busy && (
            <div className="on-media absolute inset-0 grid place-items-center bg-ink-950/70 text-[10px] text-brand-400">
              …
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            id="club-logo-input"
            type="file"
            accept={CLUB_LOGO.acceptAttr}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="btn-ghost !px-4 !py-2 text-xs"
            >
              {preview ? 'Replace logo' : 'Upload logo'}
            </button>
            {preview && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setCheck(null);
                  setError(null);
                  onChange(null);
                  onClear?.();
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="btn-ghost !px-4 !py-2 text-xs text-rose-300"
              >
                Remove
              </button>
            )}
          </div>

          <p className="hint">
            Square, at least {CLUB_LOGO.minSize}×{CLUB_LOGO.minSize} px · PNG, JPG, WebP or SVG ·
            under {CLUB_LOGO.maxBytes / 1024 / 1024} MB. Saved at {CLUB_LOGO.size}×{CLUB_LOGO.size}.
            A PNG with a transparent background looks best.
          </p>

          {error && <p className="error-text">{error}</p>}
          {!error && check?.ok && (
            <p
              className={`mt-1.5 text-xs font-medium ${
                check.square ? 'text-emerald-400' : 'text-amber-300'
              }`}
            >
              {check.square ? '✓ ' : '⚠ '}
              {check.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
