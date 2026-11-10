import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { TeammatesPage } from './pages/TeammatesPage'
import { CreateTeammatePage } from './pages/CreateTeammatePage'
import { TeammateWorkspacePage } from './pages/TeammateWorkspacePage'
import { TasksPage } from './pages/TasksPage'
import { WorkflowBuilderPage } from './pages/WorkflowBuilderPage'
import { ApprovalCenterPage } from './pages/ApprovalCenterPage'
import { ConversationsPage } from './pages/ConversationsPage'
import { IntegrationsPage } from './pages/IntegrationsPage'
import { KnowledgeBasePage } from './pages/KnowledgeBasePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ExecutionHistoryPage } from './pages/ExecutionHistoryPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="teammates" element={<TeammatesPage />} />
        <Route path="teammates/new" element={<CreateTeammatePage />} />
        <Route path="teammates/:id" element={<TeammateWorkspacePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="workflows" element={<WorkflowBuilderPage />} />
        <Route path="approvals" element={<ApprovalCenterPage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="history" element={<ExecutionHistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
