import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background bg-hero-grid text-gray-100">
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="font-semibold text-lg">Autonomous AI Teammates</div>
        <div className="flex gap-3">
          <Link to="/auth" className="btn-secondary">Sign in</Link>
          <Link to="/app" className="btn-primary">Open Dashboard</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
        <section>
          <p className="text-accent-violet uppercase tracking-widest text-sm mb-3">Enterprise AI Workforce Platform</p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-5">Deploy AI teammates that plan, execute, and escalate real business workflows.</h1>
          <p className="text-gray-300 text-lg mb-8 max-w-xl">Create specialized AI employees for sales, support, operations, and more. Configure tools, permissions, approvals, and monitor performance from a unified command center.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/app/teammates/new" className="btn-primary">Create AI Teammate</Link>
            <Link to="/app" className="btn-secondary">View Dashboard</Link>
          </div>
        </section>
        <section className="card-surface p-6">
          <h2 className="font-medium mb-4">Phase 1 Foundation</h2>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>• Project scaffold: React/Vite/TS frontend + Express/TS backend</li>
            <li>• Database architecture & RLS scaffolding for organization isolation</li>
            <li>• Authentication UI/config scaffolding (Supabase-ready)</li>
            <li>• Responsive dashboard shell and navigation</li>
            <li>• Reusable enterprise UI components (no fabricated metrics)</li>
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {['Sales Agent','Support Agent','Lead Gen','Operations'].map((r) => (
              <div key={r} className="rounded-lg border border-border bg-surface2 p-3">{r} <span className="text-gray-500">(configurable)</span></div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
