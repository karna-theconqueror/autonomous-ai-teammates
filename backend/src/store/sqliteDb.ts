import { DatabaseSync } from 'node:sqlite'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), '.data')
const dbPath = process.env.SQLITE_PATH || path.join(dataDir, 'dev.db')

let db: DatabaseSync | null = null

export function getDb() {
  if (db) return db
  fs.mkdirSync(dataDir, { recursive: true })
  db = new DatabaseSync(dbPath)
  db.exec('PRAGMA journal_mode = WAL;')
  init(db)
  return db
}

function init(db: DatabaseSync) {
  db.exec(`
  create table if not exists teammates (
    id text primary key, organization_id text not null, name text not null, job_role text not null,
    responsibilities text, objectives text, personality text, communication_style text,
    status text not null, requires_human_approval integer not null default 1,
    tools_json text not null default '[]', permissions_json text not null default '[]',
    created_at text not null, updated_at text not null
  );
  create table if not exists tasks (
    id text primary key, organization_id text not null, teammate_id text, workflow_id text,
    title text not null, objective text, status text not null, priority text, result_summary text, error_message text,
    started_at text, completed_at text, created_at text not null, updated_at text not null
  );
  create table if not exists task_steps (
    id text primary key, task_id text not null, step_index integer not null, name text not null, status text not null,
    input_json text, output_json text, error_message text, started_at text, completed_at text, created_at text not null, updated_at text not null
  );
  create table if not exists approvals (
    id text primary key, organization_id text not null, task_id text, teammate_id text, action_type text not null,
    proposed_action_json text, reason text, status text not null, reviewed_by text, reviewed_at text, review_notes text,
    created_at text not null, updated_at text not null
  );
  create table if not exists execution_logs (
    id text primary key, organization_id text not null, task_id text, teammate_id text, level text not null,
    event_type text not null, message text not null, details_json text, created_at text not null
  );
  create table if not exists workflows (
    id text primary key, organization_id text not null, name text not null, description text, definition_json text, status text not null,
    created_at text not null, updated_at text not null
  );
  create table if not exists conversations (
    id text primary key, organization_id text not null, teammate_id text, external_subject text, channel text, status text not null,
    created_at text not null, updated_at text not null
  );
  create table if not exists messages (
    id text primary key, conversation_id text not null, sender_type text not null, sender_id text, content text not null,
    metadata_json text, created_at text not null
  );
  create table if not exists memory (
    id text primary key, organization_id text not null, teammate_id text, memory_type text not null, subject_key text,
    content_json text, source text, expires_at text, created_at text not null, updated_at text not null
  );
  create table if not exists knowledge (
    id text primary key, organization_id text not null, title text not null, source text, content text, metadata_json text, status text not null,
    created_at text not null, updated_at text not null
  );
  create table if not exists integrations (
    id text primary key, organization_id text not null, provider text not null, name text not null, status text not null, config_json text,
    created_at text not null, updated_at text not null
  );
  create index if not exists idx_teammates_org on teammates(organization_id);
  create index if not exists idx_tasks_org on tasks(organization_id);
  create index if not exists idx_steps_task on task_steps(task_id);
  create index if not exists idx_approvals_org on approvals(organization_id);
  create index if not exists idx_logs_org on execution_logs(organization_id);
  `)
}
