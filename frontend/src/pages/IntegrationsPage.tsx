import { useEffect, useState } from 'react'
import { api, type Integration } from '../lib/api'

export function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>([])
  const [provider, setProvider] = useState('crm'); const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const load = async ()=>{ try{ setItems((await api.listIntegrations()).integrations) }catch(e:any){setErr(e.message)} }
  useEffect(()=>{ load() }, [])
  async function save(e:React.FormEvent){ e.preventDefault(); try{ await api.saveIntegration({ provider, name, status:'configured', config:{} }); setName(''); await load() }catch(e:any){setErr(e.message)} }
  const catalog = ['CRM','Email','Calendar','Database','Internal knowledge base','Webhook','HTTP API']
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Integrations Marketplace</h1>
      {err && <div className="text-rose-200 text-sm">{err}</div>}
      <div className="card-surface p-4 text-sm text-gray-300">Modular integration architecture. Every integration requires authentication, permission controls, error handling, and execution logs. <b>No plaintext secrets are stored</b>; use secure credential references/vault in production. Real connectors are enabled in later phases.</div>
      <form onSubmit={save} className="card-surface p-4 grid md:grid-cols-3 gap-3 items-end">
        <label className="text-sm"><span className="text-gray-300">Provider</span><select className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2" value={provider} onChange={e=>setProvider(e.target.value)}>{catalog.map(c=> <option key={c} value={c.toLowerCase().replace(/\s+/g,'_')}>{c}</option>)}</select></label>
        <label className="text-sm"><span className="text-gray-300">Name</span><input className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2" required value={name} onChange={e=>setName(e.target.value)} /></label>
        <button className="btn-primary">Register Integration</button>
      </form>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{items.length===0 ? <div className="card-surface p-6 text-gray-400">No integrations registered.</div> : items.map(i=> <div key={i.id} className="card-surface p-4"><div className="font-medium">{i.name}</div><div className="text-sm text-gray-400">{i.provider} • {i.status}</div><div className="text-xs text-gray-500 mt-2">Auth/permissions/logging enforced by architecture; connector execution not yet active.</div></div>)}</div>
    </div>
  )
}
