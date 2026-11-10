export function ActivityTimeline({ items }: { items: Array<{ id: string; text: string; at: string }> }) {
  if (items.length === 0) return <div className="card-surface p-4 text-sm text-gray-400">No activity recorded yet.</div>
  return <div className="card-surface p-4 space-y-3">{items.map(i => <div key={i.id} className="text-sm"><div>{i.text}</div><div className="text-xs text-gray-500">{i.at}</div></div>)}</div>
}
