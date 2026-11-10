import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, PlusSquare, CheckSquare, GitBranch, ShieldCheck,
  MessagesSquare, Plug, BookOpen, BarChart3, History, Settings
} from 'lucide-react'

const links = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/teammates', label: 'AI Teammates', icon: Users },
  { to: '/app/teammates/new', label: 'Create Teammate', icon: PlusSquare },
  { to: '/app/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/app/workflows', label: 'Workflows', icon: GitBranch },
  { to: '/app/approvals', label: 'Approvals', icon: ShieldCheck },
  { to: '/app/conversations', label: 'Conversations', icon: MessagesSquare },
  { to: '/app/integrations', label: 'Integrations', icon: Plug },
  { to: '/app/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/history', label: 'Execution History', icon: History },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-surface/70 backdrop-blur md:block">
      <div className="px-5 py-5 border-b border-border">
        <div className="text-sm uppercase tracking-widest text-accent-violet">AI Workforce</div>
        <div className="font-semibold text-lg">Autonomous Teammates</div>
      </div>
      <nav className="p-3 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive ? 'bg-accent-blue/20 text-white border border-accent-blue/30' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
