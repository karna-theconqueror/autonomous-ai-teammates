export function ApprovalCard({ title, reason }: { title: string; reason: string }) {
  return (
    <div className="card-surface p-4 space-y-3">
      <div className="font-medium">{title}</div>
      <div className="text-sm text-gray-400">{reason}</div>
      <div className="flex gap-2"><button className="btn-primary text-sm">Approve</button><button className="btn-secondary text-sm">Reject</button></div>
      <p className="text-xs text-gray-500">Actions are placeholders in Phase 1; approval workflow executes in later phases.</p>
    </div>
  )
}
