import { Link } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

export function TopNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-[#0a1020]/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="md:hidden font-semibold">AI Workforce</div>
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-gray-400 w-full max-w-md">
            <Search size={16} />
            <span>Search teammates, tasks, workflows...</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary px-3 py-2" aria-label="Notifications"><Bell size={16} /></button>
          <Link to="/auth" className="btn-secondary text-sm">Account</Link>
        </div>
      </div>
    </header>
  )
}
