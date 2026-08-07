'use client';

import { useCallback, useRef, useState } from 'react';
import {
  POSTER,
  THUMBNAIL,
  checkPosterDimensions,
  checkPosterFile,
  generateThumbnail,
  loadImage,
  normalisePoster,
  type PosterCheck,
} from '@/lib/poster';

export interface PosterPayload {
  poster: Blob;
  thumbnail: Blob;
  ext: string;
  previewUrl: string;
}

interface Props {
  onChange: (payload: PosterPayload | null) => void;
  initialUrl?: string | null;
}

/**
 * Poster picker that enforces the 1080×1350 (4:5) spec entirely in the browser:
 * wrong ratio never leaves the machine, right-ratio-wrong-size is auto-resized,
 * and the 540×675 WebP thumbnail is generated here too.
 */
export default function PosterUploader({ onChange, initialUrl = null }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [check, setCheck] = useState<PosterCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setCheck(null);
      setBusy(true);

      try {
        const fileError = checkPosterFile(file);
        if (fileError) {
          setError(fileError);
          onChange(null);
          return;
        }

        const img = await loadImage(file);
        const result = checkPosterDimensions(img.width, img.height);
        setCheck(result);

        if (!result.ok) {
          setError(result.message);
          onChange(null);
          setPreview(null);
          return;
        }

        const [poster, thumbnail] = await Promise.all([
          normalisePoster(file),
          generateThumbnail(file),
        ]);

        const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
        const previewUrl = URL.createObjectURL(thumbnail);
        setPreview(previewUrl);
        onChange({ poster, thumbnail, ext, previewUrl });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Something went wrong reading that image.';
        setError(message);
        onChange(null);
      } finally {
        setBusy(false);
      }
    },
    [onChange]
  );

  const clear = () => {
    setPreview(null);
    setCheck(null);
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="label" htmlFor="poster-input">
        Event poster <span className="text-brand-500">*</span>
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`relative flex gap-5  border-2 border-dashed p-5 transition ${
          dragging
            ? 'border-brand-400 bg-brand-400/5'
            : error
              ? 'border-rose-500/50 bg-rose-500/5'
              : 'border-white/15 bg-ink-900/50'
        }`}
      >
        {/* ---- 4:5 preview well ---- */}
        <div className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden border border-white/30 bg-ink-800 sm:w-36">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Poster preview" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center px-2 text-center text-[10px] leading-tight text-slate-600">
              {POSTER.width}
              <br />×<br />
              {POSTER.height}
            </div>
          )}
          {busy && (
            <div className="on-media absolute inset-0 grid place-items-center bg-ink-950/70 text-[10px] text-brand-400">
              Processing…
            </div>
          )}
        </div>

        {/* ---- controls ---- */}
        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            id="poster-input"
            type="file"
            accept={POSTER.acceptAttr}
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
              {preview ? 'Replace poster' : 'Choose poster'}
            </button>
            {preview && (
              <button
                type="button"
                onClick={clear}
                className="btn-ghost !px-4 !py-2 text-xs text-rose-300"
              >
                Remove
              </button>
            )}
          </div>

          <p className="hint">
            Required: <strong className="text-slate-300">{POSTER.width} × {POSTER.height} px</strong>{' '}
            ({POSTER.ratioLabel} portrait) · JPG, PNG or WebP · under{' '}
            {POSTER.maxBytes / 1024 / 1024} MB. A {THUMBNAIL.width} × {THUMBNAIL.height} thumbnail is
            generated automatically for the event card.
          </p>

          {error && <p className="error-text">{error}</p>}

          {!error && check?.ok && (
            <p
              className={`mt-1.5 text-xs font-medium ${
                check.exact ? 'text-emerald-400' : 'text-amber-300'
              }`}
            >
              {check.exact ? '✓ ' : '⚠ '}
              {check.message}
            </p>
          )}

          <p className="mt-2 text-[11px] text-slate-600">
            Drag and drop works too. Keep the event name inside the middle 80% of the canvas.
          </p>
        </div>
      </div>
    </div>
  );
}
