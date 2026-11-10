export function SimplePage({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="card-surface p-6 text-gray-300">
        <p>{description}</p>
        <p className="text-sm text-gray-500 mt-3">Phase 1 scaffold: UI shell and navigation are in place; functional data and workflows are implemented in subsequent phases with real backend/database integration.</p>
      </div>
    </div>
  )
}
