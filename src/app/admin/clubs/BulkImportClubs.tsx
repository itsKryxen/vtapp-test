'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { bulkImportClubs, type BulkImportRow, type BulkImportResult } from './actions';
import { SCHOOLS } from '@/lib/schools';

const CSV_HEADERS = ['school', 'name', 'contact_name', 'contact_email', 'tagline', 'contact_phone', 'instagram'] as const;

const SAMPLE_ROWS: string[][] = [
  ['SCOPE', 'Google Developer Group VIT-AP', 'Rahul Kumar', 'gdg@vitap.ac.in', 'Build with Google tech', '+91 90000 00000', '@gdg_vitap'],
  ['SENSE', 'IEEE Student Branch', 'Priya Sharma', 'ieee@vitap.ac.in', 'Advancing technology', '', '@ieee_vitap'],
  ['CENTRAL', 'Dance Club VIT-AP', 'Aarav Patel', 'dance@vitap.ac.in', '', '', ''],
];

function generateCSVTemplate(): string {
  const header = CSV_HEADERS.join(',');
  const rows = SAMPLE_ROWS.map((r) => r.map((v) => (v.includes(',') ? `"${v}"` : v)).join(','));
  return [header, ...rows].join('\n');
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        let val = '';
        i++; // skip opening quote
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') {
            val += '"';
            i += 2;
          } else if (line[i] === '"') {
            i++; // skip closing quote
            break;
          } else {
            val += line[i];
            i++;
          }
        }
        cells.push(val);
        if (line[i] === ',') i++; // skip delimiter
      } else {
        const next = line.indexOf(',', i);
        if (next === -1) {
          cells.push(line.slice(i));
          i = line.length;
        } else {
          cells.push(line.slice(i, next));
          i = next + 1;
        }
      }
    }
    rows.push(cells);
  }
  return rows;
}

const SCHOOL_CODES_SET = new Set<string>(SCHOOLS.map((s) => s.code));

interface ParsedRow {
  raw: string[];
  data: BulkImportRow;
  errors: string[];
}

function validateRows(rows: string[][]): ParsedRow[] {
  return rows.map((cells) => {
    const errors: string[] = [];
    const [school, name, contact_name, contact_email, tagline, contact_phone, instagram] = cells.map((c) => c?.trim() ?? '');

    if (!school) errors.push('School is required');
    else if (!SCHOOL_CODES_SET.has(school.toUpperCase())) errors.push(`Invalid school: ${school}`);

    if (!name || name.length < 2) errors.push('Name is required (min 2 chars)');
    if (!contact_name) errors.push('Contact name is required');
    if (!contact_email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact_email)) errors.push('Valid email is required');

    return {
      raw: cells,
      data: {
        school: school.toUpperCase(),
        name,
        contact_name,
        contact_email: contact_email.toLowerCase(),
        tagline: tagline || null,
        contact_phone: contact_phone || null,
        instagram: instagram || null,
      },
      errors,
    };
  });
}

type Phase = 'idle' | 'preview' | 'importing' | 'done';

export default function BulkImportClubs() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<BulkImportResult[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const allRows = parseCSV(text);
      // Skip header row if it matches expected headers
      const firstRow = allRows[0]?.map((c) => c.trim().toLowerCase());
      const isHeader = firstRow && CSV_HEADERS.every((h, i) => firstRow[i] === h);
      const dataRows = isHeader ? allRows.slice(1) : allRows;
      const filtered = dataRows.filter((r) => r.some((c) => c.trim()));
      setParsed(validateRows(filtered));
      setResults([]);
      setPhase('preview');
    };
    reader.readAsText(file);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) handleFile(file);
    },
    [handleFile],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile],
  );

  const validRows = parsed.filter((r) => r.errors.length === 0);
  const invalidRows = parsed.filter((r) => r.errors.length > 0);

  async function handleImport() {
    if (validRows.length === 0) return;
    setPhase('importing');
    setProgress(0);
    setResults([]);

    const rows = validRows.map((r) => r.data);
    const res = await bulkImportClubs(rows);

    // Animate progress
    for (let i = 1; i <= res.length; i++) {
      setProgress(i);
      setResults(res.slice(0, i));
      await new Promise((r) => setTimeout(r, 60));
    }

    setPhase('done');
    router.refresh();
  }

  function reset() {
    setPhase('idle');
    setParsed([]);
    setResults([]);
    setProgress(0);
  }

  const successCount = results.filter((r) => r.ok).length;
  const failCount = results.filter((r) => !r.ok).length;

  return (
    <section className="mt-8">
      <div className="panel overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/30 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-light text-white">Bulk import clubs</h2>
            <p className="mt-0.5 text-xs text-slate-500">Upload a CSV to register multiple clubs at once</p>
          </div>
          <button
            type="button"
            onClick={() => downloadCSV(generateCSVTemplate(), 'vtapp_clubs_template.csv')}
            className="btn-ghost text-xs"
            id="download-csv-template"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CSV template
          </button>
        </div>

        {/* Upload zone */}
        {phase === 'idle' && (
          <div
            className={`m-4 flex flex-col items-center justify-center  border-2 border-dashed p-12 text-center transition-all duration-200 ${
              dragOver
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-white/30 hover:border-white/40 hover:bg-white/[0.02]'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click(); }}
            id="csv-drop-zone"
          >
            <div className={`mb-4  p-3 transition-colors ${dragOver ? 'bg-brand-500/20' : 'bg-white/5'}`}>
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-300">
              {dragOver ? 'Drop your CSV file here' : 'Drag & drop a CSV file, or click to browse'}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Required columns: school, name, contact_name, contact_email
            </p>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFileChange} id="csv-file-input" />
          </div>
        )}

        {/* Preview table */}
        {phase === 'preview' && (
          <div className="p-4">
            {/* Summary chips */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="chip">
                <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
                {parsed.length} total rows
              </span>
              <span className="chip">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                {validRows.length} valid
              </span>
              {invalidRows.length > 0 && (
                <span className="chip">
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
                  {invalidRows.length} with errors
                </span>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-white/30">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/30 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-3 py-2.5 w-8">#</th>
                    <th className="px-3 py-2.5">School</th>
                    <th className="px-3 py-2.5">Club name</th>
                    <th className="px-3 py-2.5">Contact</th>
                    <th className="px-3 py-2.5">Email</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {parsed.map((row, i) => (
                    <tr
                      key={i}
                      className={`transition-colors ${
                        row.errors.length > 0 ? 'bg-rose-500/[0.04]' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-xs text-slate-500">{i + 1}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-brand-400">{row.data.school}</td>
                      <td className="px-3 py-2.5 text-white">{row.data.name}</td>
                      <td className="px-3 py-2.5 text-slate-400">{row.data.contact_name}</td>
                      <td className="px-3 py-2.5 text-slate-400">{row.data.contact_email}</td>
                      <td className="px-3 py-2.5">
                        {row.errors.length > 0 ? (
                          <span className="text-xs text-rose-400" title={row.errors.join(', ')}>
                            ⚠ {row.errors[0]}
                            {row.errors.length > 1 && ` +${row.errors.length - 1}`}
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleImport}
                disabled={validRows.length === 0}
                className="btn-primary"
                id="bulk-import-submit"
              >
                Import {validRows.length} club{validRows.length !== 1 ? 's' : ''}
              </button>
              <button type="button" onClick={reset} className="btn-ghost text-xs" id="bulk-import-cancel">
                Cancel
              </button>
              {invalidRows.length > 0 && (
                <p className="text-xs text-slate-500">
                  {invalidRows.length} row{invalidRows.length !== 1 ? 's' : ''} with errors will be skipped
                </p>
              )}
            </div>
          </div>
        )}

        {/* Importing progress */}
        {phase === 'importing' && (
          <div className="p-6">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-slate-300">Importing clubs…</span>
              <span className="font-mono text-xs text-slate-500">
                {progress}/{validRows.length}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${(progress / validRows.length) * 100}%`,
                  background: 'linear-gradient(90deg, rgb(var(--brand-500)), var(--brand-bright))',
                }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {phase === 'done' && (
          <div className="p-4">
            {/* Summary */}
            <div className="mb-4 flex flex-wrap gap-2">
              {successCount > 0 && (
                <span className="chip">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  {successCount} created
                </span>
              )}
              {failCount > 0 && (
                <span className="chip">
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
                  {failCount} failed
                </span>
              )}
            </div>

            {/* Results table */}
            <div className="overflow-x-auto border border-white/30">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/30 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-3 py-2.5">Club name</th>
                    <th className="px-3 py-2.5">Club ID</th>
                    <th className="px-3 py-2.5">Email</th>
                    <th className="px-3 py-2.5">Password</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map((r, i) => (
                    <tr
                      key={i}
                      className={`${r.ok ? 'hover:bg-white/[0.03]' : 'bg-rose-500/[0.04]'}`}
                    >
                      <td className="px-3 py-2.5 text-white">{r.name}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-brand-400">{r.clubId ?? '--'}</td>
                      <td className="px-3 py-2.5 text-slate-400">{r.email}</td>
                      <td className="px-3 py-2.5">
                        {r.password ? (
                          <code className="bg-white/10 px-2 py-1 text-xs text-emerald-300">{r.password}</code>
                        ) : (
                          <span className="text-xs text-slate-500">--</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {r.ok ? (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            Created
                          </span>
                        ) : (
                          <span className="text-xs text-rose-400" title={r.message}>{r.message}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Copy all and warning */}
            {successCount > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  id="copy-all-credentials"
                  onClick={() => {
                    const lines = results
                      .filter((r) => r.ok && r.password)
                      .map((r) => `${r.clubId}\t${r.name}\t${r.email}\t${r.password}`)
                      .join('\n');
                    navigator.clipboard.writeText(`Club ID\tName\tEmail\tPassword\n${lines}`);
                  }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy all credentials
                </button>
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  id="download-credentials-csv"
                  onClick={() => {
                    const header = 'Club ID,Name,Email,Password';
                    const rows = results
                      .filter((r) => r.ok && r.password)
                      .map((r) => `${r.clubId},"${r.name}",${r.email},${r.password}`);
                    downloadCSV([header, ...rows].join('\n'), 'vtapp_credentials.csv');
                  }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download credentials CSV
                </button>
              </div>
            )}

            <div className="mt-3 border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300/80">
              ⚠ Passwords are generated once and never stored. Copy or download them now. They cannot be recovered.
            </div>

            <button type="button" onClick={reset} className="btn-ghost mt-4 text-xs" id="bulk-import-done">
              Done, import more
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
