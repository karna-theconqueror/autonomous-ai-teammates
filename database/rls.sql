-- RLS policies for organization-level isolation (Supabase)
-- Assumes Supabase Auth: auth.uid() maps to organization_members.user_id

-- Helper: is member of org
create or replace function public.is_org_member(org uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org and m.user_id = auth.uid()
  );
$$;

-- Organizations: members can read their orgs
drop policy if exists orgs_select on public.organizations;
create policy orgs_select on public.organizations for select using (public.is_org_member(id));
drop policy if exists orgs_update on public.organizations;
create policy orgs_update on public.organizations for update using (
  exists (select 1 from public.organization_members m where m.organization_id = id and m.user_id = auth.uid() and m.role in ('owner','admin'))
);

-- Members
drop policy if exists members_select on public.organization_members;
create policy members_select on public.organization_members for select using (public.is_org_member(organization_id));
drop policy if exists members_manage on public.organization_members;
create policy members_manage on public.organization_members for all using (
  exists (select 1 from public.organization_members m where m.organization_id = organization_members.organization_id and m.user_id = auth.uid() and m.role in ('owner','admin'))
) with check (
  exists (select 1 from public.organization_members m where m.organization_id = organization_members.organization_id and m.user_id = auth.uid() and m.role in ('owner','admin'))
);

-- Generic org-scoped tables
-- ai_teammates
drop policy if exists teammates_rw on public.ai_teammates;
create policy teammates_rw on public.ai_teammates for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

-- tasks, approvals, logs, memory, workflows etc.
drop policy if exists tasks_rw on public.tasks;
create policy tasks_rw on public.tasks for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

drop policy if exists approvals_rw on public.approval_requests;
create policy approvals_rw on public.approval_requests for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

drop policy if exists logs_r on public.execution_logs;
create policy logs_r on public.execution_logs for select using (public.is_org_member(organization_id));
drop policy if exists logs_i on public.execution_logs;
create policy logs_i on public.execution_logs for insert with check (public.is_org_member(organization_id));

drop policy if exists memory_rw on public.agent_memory;
create policy memory_rw on public.agent_memory for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

-- Apply similar patterns to workflows, workflow_executions, conversations/messages (via conversation), knowledge_documents, integrations, integration_credentials, task_steps (via task), teammate_tools, agent_permissions, performance_metrics.
-- integration_credentials: restrict to owner/admin roles in production.
drop policy if exists creds_admin on public.integration_credentials;
create policy creds_admin on public.integration_credentials for all using (
  exists (
    select 1 from public.integrations i join public.organization_members m on m.organization_id=i.organization_id
    where i.id = integration_credentials.integration_id and m.user_id = auth.uid() and m.role in ('owner','admin')
  )
) with check (
  exists (
    select 1 from public.integrations i join public.organization_members m on m.organization_id=i.organization_id
    where i.id = integration_credentials.integration_id and m.user_id = auth.uid() and m.role in ('owner','admin')
  )
);
