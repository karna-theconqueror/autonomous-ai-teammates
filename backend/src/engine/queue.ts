import crypto from 'crypto'
import { runTask } from './executor'
import * as store from '../store/devStore'

type Job = { id: string; orgId: string; taskId: string; status: 'queued'|'running'|'done'|'failed'; attempts: number; maxAttempts: number; createdAt: number }
const jobs = new Map<string, Job>()
const seen = new Set<string>() // idempotency for (org,task) active runs

export function enqueueTaskRun(orgId: string, taskId: string) {
  const key = `${orgId}:${taskId}:run`
  if (seen.has(key)) {
    void store.addLog(orgId, { task_id: taskId, event_type: 'job_deduped', message: 'Duplicate run ignored (idempotency)', details: {} })
    return null
  }
  const job: Job = { id: crypto.randomUUID(), orgId, taskId, status: 'queued', attempts: 0, maxAttempts: 2, createdAt: Date.now() }
  jobs.set(job.id, job); seen.add(key)
  setImmediate(async () => {
    job.status = 'running'
    try {
      await Promise.race([
        runTask(orgId, taskId),
        new Promise((_, rej) => setTimeout(()=>rej(new Error('Execution timeout')), 120000))
      ])
      job.status = 'done'
    } catch (e:any) {
      job.attempts++
      if (job.attempts < job.maxAttempts) {
        try { await runTask(orgId, taskId); job.status='done' } catch { job.status='failed' }
      } else job.status = 'failed'
      void store.addLog(orgId, { task_id: taskId, level: 'error', event_type: 'job_failed', message: e.message || 'Job failed', details: { jobId: job.id } })
    } finally {
      setTimeout(()=>seen.delete(key), 5000)
    }
  })
  return job.id
}
