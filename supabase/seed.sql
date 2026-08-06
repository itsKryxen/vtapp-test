-- ============================================================================
-- V-TAPP 2026, seed data. Run AFTER schema.sql.
-- ============================================================================

insert into public.schools (code, name, short_name, accent, sort_order) values
  ('SCOPE',   'School of Computer Science and Engineering',            'Computer Science',  '#22d3ee', 10),
  ('SENSE',   'School of Electronics Engineering',                     'Electronics',       '#8b5cf6', 20),
  ('SMEC',    'School of Mechanical Engineering',                      'Mechanical',        '#f97316', 30),
  ('SAS',     'School of Advanced Sciences',                           'Advanced Sciences', '#a3e635', 40),
  ('VSB',     'VIT-AP School of Business',                             'Business',          '#f0308c', 50),
  ('VSL',     'VIT-AP School of Law',                                  'Law',               '#eab308', 60),
  ('VISH',    'VIT-AP School of Social Sciences and Humanities',       'Social Sciences',   '#38bdf8', 70),
  ('CENTRAL', 'Central / University-wide Clubs',                       'Central',           '#e2e8f0', 80)
on conflict (code) do update
  set name = excluded.name,
      short_name = excluded.short_name,
      accent = excluded.accent,
      sort_order = excluded.sort_order;

-- --------------------------------------------------------------------------
-- Issue club IDs. Each call returns the next ID for that school:
--   1st SCOPE club -> VT26_SCOPE_001, 2nd -> VT26_SCOPE_002, ...
-- Replace these with your real clubs.
-- --------------------------------------------------------------------------
select public.issue_club_id('SCOPE', 'Google Developer Group VIT-AP', 'Aditya Rao',  'gdg@vitap.ac.in',   'Build with Google tech');
select public.issue_club_id('SCOPE', 'Cybernauts',                    'Nikhil S',    'cyber@vitap.ac.in', 'Security and CTF');
select public.issue_club_id('SENSE', 'IEEE Student Branch',           'Priya M',     'ieee@vitap.ac.in',  'Electronics, radio and RF');
select public.issue_club_id('SMEC',  'SAE Collegiate Club',           'Rohit Verma', 'sae@vitap.ac.in',   'Automotive engineering');
select public.issue_club_id('SAS',   'Bioverse',                      'Sneha Reddy', 'bio@vitap.ac.in',   'Biotech and life sciences');
select public.issue_club_id('VSB',   'E-Cell VIT-AP',                 'Karthik N',   'ecell@vitap.ac.in', 'Entrepreneurship');

-- --------------------------------------------------------------------------
-- Linking a login to a club (do this after the user signs up):
--
--   insert into public.club_members (user_id, club_id, role, full_name)
--   values ('<auth-user-uuid>', 'VT26_SCOPE_001', 'club', 'Aditya Rao');
--
-- Making someone an admin:
--
--   insert into public.club_members (user_id, club_id, role, full_name)
--   values ('<auth-user-uuid>', null, 'admin', 'Core Team');
-- --------------------------------------------------------------------------
