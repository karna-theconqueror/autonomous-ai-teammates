export function TaskTable({ rows }: { rows: Array<{ id: string; title: string; status: string }> }) {
  return (
    <div className="card-surface overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-surface2 text-gray-400"><tr><th className="text-left p-3">Task</th><th className="text-left p-3">Status</th></tr></thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="p-4 text-gray-400" colSpan={2}>No tasks available. Data will appear from the database when workflows run.</td></tr>
          ) : rows.map(r => (<tr key={r.id} className="border-t border-border"><td className="p-3">{r.title}</td><td className="p-3">{r.status}</td></tr>))}
        </tbody>
      </table>
    </div>
  )
}
