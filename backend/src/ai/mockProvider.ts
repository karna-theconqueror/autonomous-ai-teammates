/**
 * Mock AI provider for development/testing (no paid APIs required).
 * Clearly separated from real LLM execution. Produces deterministic structured plans.
 */

export type PlanStep = { name: string; tool?: string; action: string; requires_approval?: boolean; input?: any }

export async function mockPlan(objective: string, role: string): Promise<{ steps: PlanStep[]; summary: string }> {
  const base: PlanStep[] = [
    { name: 'Understand objective', action: 'analyze', input: { objective } },
    { name: 'Gather context', action: 'retrieve_context', tool: 'knowledge_base', input: { query: objective } },
  ]
  const roleSteps: Record<string, PlanStep[]> = {
    'Sales AI Agent': [
      { name: 'Qualify lead', action: 'categorize_lead', tool: 'crm', input: { objective } },
      { name: 'Draft response or quote', action: 'prepare_response', tool: 'email', requires_approval: true, input: { objective } },
    ],
    'Customer Support AI Agent': [
      { name: 'Search knowledge base', action: 'search_kb', tool: 'knowledge_base', input: { objective } },
      { name: 'Draft resolution or ticket update', action: 'update_ticket', tool: 'database', requires_approval: true, input: { objective } },
    ],
    'Lead Generation AI Agent': [
      { name: 'Identify prospect criteria', action: 'analyze', input: { objective } },
      { name: 'Prepare outreach draft', action: 'prepare_outreach', tool: 'email', requires_approval: true, input: { objective } },
    ],
    'Order Management AI Agent': [
      { name: 'Check order context', action: 'query_orders', tool: 'database', input: { objective } },
      { name: 'Propose order action', action: 'order_action', tool: 'database', requires_approval: true, input: { objective } },
    ],
    'Appointment Booking AI Agent': [
      { name: 'Check availability', action: 'check_calendar', tool: 'calendar', input: { objective } },
      { name: 'Propose booking', action: 'schedule', tool: 'calendar', requires_approval: true, input: { objective } },
    ],
    'Business Operations AI Agent': [
      { name: 'Assess operational request', action: 'analyze', input: { objective } },
      { name: 'Propose operational action', action: 'ops_action', tool: 'database', requires_approval: true, input: { objective } },
    ],
  }
  const tail: PlanStep[] = [
    { name: 'Verify outcome', action: 'verify', input: {} },
    { name: 'Generate report', action: 'report', input: {} },
  ]
  return { summary: `Mock plan for ${role}: ${objective}`.slice(0,200), steps: [...base, ...(roleSteps[role] || roleSteps['Business Operations AI Agent']), ...tail] }
}
