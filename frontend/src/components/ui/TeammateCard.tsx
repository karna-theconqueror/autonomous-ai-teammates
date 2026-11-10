import { StatusIndicator } from './StatusIndicator'

export function TeammateCard({ name, role, status }: { name: string; role: string; status: 'healthy'|'warning'|'error'|'idle' }) {
  return (
    <div className="card-surface p-4 space-y-2">
      <div className="flex items-center justify-between"><h3 className="font-medium">{name}</h3><StatusIndicator status={status} label={status} /></div>
      <p className="text-sm text-gray-400">{role}</p>
    </div>
  )
}
