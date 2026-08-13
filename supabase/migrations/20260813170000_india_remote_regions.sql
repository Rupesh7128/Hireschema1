-- India-only remote eligibility: WORLD / empty regions are no longer visible.
-- Retag existing remote jobs so India-eligible remotes keep showing after
-- job_visible_for_market_sql requires allowed_regions to include IN.

UPDATE public.jobs
SET allowed_regions = ARRAY['IN']::text[]
WHERE is_remote = TRUE
  AND deleted_at IS NULL
  AND (
    allowed_regions IS NULL
    OR cardinality(allowed_regions) = 0
    OR 'WORLD' = ANY(allowed_regions)
  );

UPDATE public.candidates
SET display_currency = 'INR'
WHERE display_currency IS NOT NULL
  AND display_currency NOT IN ('auto', 'INR');
