import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { healthRouter } from './routes/health'
import { dashboardRouter } from './routes/dashboard'
import { teammatesRouter } from './routes/teammates'
import { tasksRouter } from './routes/tasks'
import { approvalsRouter } from './routes/approvals'
import { workflowsRouter } from './routes/workflows'
import { conversationsRouter, knowledgeRouter, integrationsRouter, historyRouter } from './routes/misc'
import { authContext } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const port = Number(process.env.PORT) || 4000

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }))
app.use(express.json({ limit: '1mb' }))
app.use(rateLimit({ windowMs: 60_000, limit: 120 }))
app.use(authContext)

app.use('/api/health', healthRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/teammates', teammatesRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/approvals', approvalsRouter)
app.use('/api/workflows', workflowsRouter)
app.use('/api/conversations', conversationsRouter)
app.use('/api/knowledge', knowledgeRouter)
app.use('/api/integrations', integrationsRouter)
app.use('/api/history', historyRouter)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`[backend] listening on http://localhost:${port}`)
})
