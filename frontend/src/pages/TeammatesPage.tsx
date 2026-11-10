import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Teammate } from '../lib/api'
import { StatusIndicator } from '../components/ui/StatusIndicator'

function statusTone(s: Teammate['status']) {
  if (s === 'active') return 'healthy' as const
  if (s === 'paused') return 'warning' as const
  return 'idle' as const
}

export function TeammatesPage() {
  const [teammates, setTeammates] = useState<Teammate[]>([])
  const [source, setSource] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.listTeammates().then(d => { setTeammates(d.teammates); setSource(d.source) }).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">AI Teammates Directory</h1>
          <p className="text-sm text-gray-400">Configured AI employees, roles, status, and permissions. Source: {source || '…'}</p>
        </div>
        <Link to="/app/teammates/new" className="btn-primary">Create Teammate</Link>
      </div>
      {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}
      {loading ? <div className="card-surface p-6 text-gray-400">Loading teammates…</div> :
        teammates.length === 0 ? <div className="card-surface p-6 text-gray-400">No AI teammates created yet. Use "Create Teammate" to configure your first AI employee.</div> :
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {teammates.map(t => (
            <Link key={t.id} to={`/app/teammates/${t.id}`} className="card-surface p-4 space-y-2 hover:border-accent-blue/40 transition block">
              <div className="flex items-center justify-between"><h3 className="font-medium">{t.name}</h3><StatusIndicator status={statusTone(t.status)} label={t.status} /></div>
              <p className="text-sm text-gray-400">{t.job_role}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{t.objectives || t.responsibilities || 'No objectives defined yet.'}</p>
              <div className="text-xs text-gray-500">{t.tools.filter(x=>x.enabled).length} tools • {t.permissions.filter(x=>x.allowed).length} permissions</div>
            </Link>
          ))}
        </div>}
    </div>
  )
}
