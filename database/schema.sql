-- Autonomous AI Teammates - initial schema (Phase 1 foundation)
-- Target: PostgreSQL / Supabase

create extension if not exists "pgcrypto";

-- Users are managed by Supabase Auth (auth.users). Mirror/profile as needed.
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null, -- references auth.users(id) in Supabase
  role text not null check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.ai_teammates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  job_role text not null,
  responsibilities text,
  objectives text,
  personality text,
  communication_style text,
  status text not null default 'inactive' check (status in ('active','paused','inactive')),
  requires_human_approval boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teammate_tools (
  id uuid primary key default gen_random_uuid(),
  teammate_id uuid not null references public.ai_teammates(id) on delete cascade,
  tool_key text not null,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teammate_id, tool_key)
);

create table if not exists public.agent_permissions (
  id uuid primary key default gen_random_uuid(),
  teammate_id uuid not null references public.ai_teammates(id) on delete cascade,
  permission_key text not null,
  allowed boolean not null default false,
  requires_approval boolean not null default true,
  constraints jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teammate_id, permission_key)
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  definition jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  teammate_id uuid references public.ai_teammates(id) on delete set null,
  workflow_id uuid references public.workflows(id) on delete set null,
  title text not null,
  objective text,
  status text not null default 'pending' check (status in ('pending','planning','in_progress','awaiting_approval','completed','failed','cancelled')),
  priority text not null default 'normal',
  result_summary text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_steps (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  step_index int not null,
  name text not null,
  status text not null default 'pending' check (status in ('pending','running','succeeded','failed','skipped','awaiting_approval')),
  input jsonb,
  output jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (task_id, step_index)
);

create table if not exists public.workflow_executions (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  status text not null default 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  teammate_id uuid references public.ai_teammates(id) on delete set null,
  external_subject text,
  channel text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('user','customer','teammate','system','human_employee')),
  sender_id uuid,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  source text,
  content text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  name text not null,
  status text not null default 'disconnected',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Never store plaintext secrets. Store references to a secret manager/vault or encrypted blobs managed server-side.
create table if not exists public.integration_credentials (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade,
  credential_ref text not null, -- vault/secret-manager reference or encrypted handle
  key_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  teammate_id uuid references public.ai_teammates(id) on delete set null,
  action_type text not null,
  proposed_action jsonb not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','edited','taken_over')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.execution_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  teammate_id uuid references public.ai_teammates(id) on delete set null,
  level text not null default 'info',
  event_type text not null,
  message text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_memory (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  teammate_id uuid references public.ai_teammates(id) on delete set null,
  memory_type text not null check (memory_type in ('short_term','long_term','workflow','customer')),
  subject_key text,
  content jsonb not null,
  source text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.performance_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  teammate_id uuid references public.ai_teammates(id) on delete set null,
  metric_name text not null,
  metric_value numeric not null,
  dimensions jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_members_org_user on public.organization_members(organization_id, user_id);
create index if not exists idx_teammates_org_status on public.ai_teammates(organization_id, status);
create index if not exists idx_tasks_org_status on public.tasks(organization_id, status);
create index if not exists idx_tasks_teammate on public.tasks(teammate_id);
create index if not exists idx_steps_task on public.task_steps(task_id, step_index);
create index if not exists idx_approvals_org_status on public.approval_requests(organization_id, status);
create index if not exists idx_logs_org_created on public.execution_logs(organization_id, created_at desc);
create index if not exists idx_memory_org_type on public.agent_memory(organization_id, memory_type);
create index if not exists idx_metrics_org_teammate on public.performance_metrics(organization_id, teammate_id, recorded_at desc);

-- RLS templates (enable and refine per Supabase auth.uid() membership checks)
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.ai_teammates enable row level security;
alter table public.tasks enable row level security;
alter table public.approval_requests enable row level security;
alter table public.execution_logs enable row level security;
alter table public.agent_memory enable row level security;

-- Example policy pattern (requires membership mapping):
-- create policy "org members read" on public.ai_teammates for select
-- using (exists (
--   select 1 from public.organization_members m
--   where m.organization_id = ai_teammates.organization_id and m.user_id = auth.uid()
-- ));
