export function IntegrationCard({ name, description }: { name: string; description: string }) {
  return (
    <div className="card-surface p-4 space-y-2">
      <div className="font-medium">{name}</div>
      <p className="text-sm text-gray-400">{description}</p>
      <div className="text-xs text-gray-500">Authentication, permissions, and execution logs required before enablement.</div>
    </div>
  )
}
