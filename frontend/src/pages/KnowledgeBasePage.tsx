import { useEffect, useState } from 'react'
import { api, type KnowledgeDoc } from '../lib/api'

export function KnowledgeBasePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([])
  const [title, setTitle] = useState(''); const [content, setContent] = useState(''); const [source, setSource] = useState('')
  const [err, setErr] = useState('')
  const load = async ()=>{ try{ setDocs((await api.listKnowledge()).documents) }catch(e:any){setErr(e.message)} }
  useEffect(()=>{ load() }, [])
  async function add(e:React.FormEvent){ e.preventDefault(); try{ await api.addKnowledge({ title, content, source, status:'approved' }); setTitle(''); setContent(''); setSource(''); await load() }catch(e:any){setErr(e.message)} }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Knowledge Base</h1>
      {err && <div className="text-rose-200 text-sm">{err}</div>}
      <form onSubmit={add} className="card-surface p-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-sm"><span className="text-gray-300">Title</span><input className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2" required value={title} onChange={e=>setTitle(e.target.value)} /></label>
          <label className="text-sm"><span className="text-gray-300">Source</span><input className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2" value={source} onChange={e=>setSource(e.target.value)} /></label>
        </div>
        <label className="text-sm block"><span className="text-gray-300">Approved content</span><textarea className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2" rows={4} value={content} onChange={e=>setContent(e.target.value)} /></label>
        <button className="btn-primary">Add Document</button>
      </form>
      <div className="space-y-3">{docs.length===0 ? <div className="card-surface p-6 text-gray-400">No knowledge documents yet.</div> : docs.map(d=> <div key={d.id} className="card-surface p-4"><div className="flex justify-between"><div className="font-medium">{d.title}</div><span className="text-xs text-gray-400">{d.status}</span></div><div className="text-xs text-gray-500">{d.source}</div><p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap line-clamp-4">{d.content}</p></div>)}</div>
    </div>
  )
}
