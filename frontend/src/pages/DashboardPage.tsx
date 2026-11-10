import { useEffect, useState } from 'react'
import { StatusIndicator } from '../components/ui/StatusIndicator'
import { AnalyticsChart } from '../components/ui/AnalyticsChart'

type Metrics = {
  totalTeammates: number
  activeTeammates: number
  tasksCompleted: number
  tasksInProgress: number
  tasksRequiringApproval: number
  failedTasks: number
  averageTaskCompletionTimeSeconds: number | null
  successRate: number | null
  humanEscalationRate: number | null
}

export function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [source, setSource] = useState<string>('loading')

  useEffect(() => {
    fetch('/api/dashboard/metrics')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setMetrics(d.metrics); setSource(d.source) })
      .catch(() => { setMetrics(null); setSource('unavailable') })
  }, [])

  const cards = [
    { label: 'Total AI Teammates', value: metrics?.totalTeammates ?? '—' },
    { label: 'Active Teammates', value: metrics?.activeTeammates ?? '—' },
    { label: 'Tasks Completed', value: metrics?.tasksCompleted ?? '—' },
    { label: 'Tasks In Progress', value: metrics?.tasksInProgress ?? '—' },
    { label: 'Tasks Requiring Approval', value: metrics?.tasksRequiringApproval ?? '—' },
    { label: 'Failed Tasks', value: metrics?.failedTasks ?? '—' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">AI Workforce Dashboard</h1>
          <p className="text-gray-400 text-sm">Monitor teammates, workflows, approvals, and performance. Metrics shown from real data sources only.</p>
        </div>
        <StatusIndicator status={source === 'unconfigured' ? 'warning' : source === 'unavailable' ? 'error' : 'healthy'} label={`Data source: ${source}`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className="card-surface p-4">
            <div className="text-sm text-gray-400">{c.label}</div>
            <div className="text-2xl font-semibold mt-2">{String(c.value)}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-surface p-4">
          <h2 className="font-medium mb-3">Performance Overview</h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-surface2 p-3 border border-border">
              <div className="text-gray-400">Avg Completion</div>
              <div className="mt-1 font-medium">{metrics?.averageTaskCompletionTimeSeconds == null ? 'No data' : `${metrics.averageTaskCompletionTimeSeconds}s`}</div>
            </div>
            <div className="rounded-lg bg-surface2 p-3 border border-border">
              <div className="text-gray-400">Success Rate</div>
              <div className="mt-1 font-medium">{metrics?.successRate == null ? 'No data' : `${metrics.successRate}%`}</div>
            </div>
            <div className="rounded-lg bg-surface2 p-3 border border-border">
              <div className="text-gray-400">Escalation Rate</div>
              <div className="mt-1 font-medium">{metrics?.humanEscalationRate == null ? 'No data' : `${metrics.humanEscalationRate}%`}</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">No fabricated statistics are displayed. Connect database and backend aggregation in later phases.</p>
        </div>
        <AnalyticsChart title="Task Throughput (real data required)" data={[]} />
      </div>
    </div>
  )
}
