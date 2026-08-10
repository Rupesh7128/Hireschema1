-- Invite-only waitlist: collect emails; superadmin approves before signup.
CREATE TABLE IF NOT EXISTS public.invite_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  note text,
  source text NOT NULL DEFAULT 'web',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS invite_requests_email_uidx
  ON public.invite_requests (lower(email));

CREATE INDEX IF NOT EXISTS invite_requests_status_created_idx
  ON public.invite_requests (status, created_at DESC);

ALTER TABLE public.invite_requests ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.invite_requests IS
  'Invite-only waitlist. Public insert via API; approve/reject via super-admin.';
