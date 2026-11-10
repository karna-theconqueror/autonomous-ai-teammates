type Status = 'healthy' | 'warning' | 'error' | 'idle'
const styles: Record<Status, string> = {
  healthy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  error: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  idle: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
}
export function StatusIndicator({ status, label }: { status: Status; label: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${styles[status]}`}>{label}</span>
}
