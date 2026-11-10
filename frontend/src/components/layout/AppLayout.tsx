import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-gray-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <TopNav />
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-hero-grid">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
