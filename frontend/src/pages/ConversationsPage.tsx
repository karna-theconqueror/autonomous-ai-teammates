import { useEffect, useState } from 'react'
import { api, type Conversation, type Message } from '../lib/api'

export function ConversationsPage() {
  const [items, setItems] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const load = async ()=>{ try{ setItems((await api.listConversations()).conversations) }catch(e:any){setErr(e.message)} }
  useEffect(()=>{ load() }, [])
  async function open(id:string){ setSelected(id); try{ setMessages((await api.listMessages(id)).messages) }catch(e:any){setErr(e.message)} }
  async function create(e:React.FormEvent){ e.preventDefault(); try{ const c=await api.createConversation({ external_subject: subject, channel:'internal' }); setSubject(''); await load(); await open(c.conversation.id) }catch(e:any){setErr(e.message)} }
  async function send(e:React.FormEvent){ e.preventDefault(); if(!selected) return; try{ await api.addMessage(selected,{ sender_type:'user', content:text }); setText(''); await open(selected) }catch(e:any){setErr(e.message)} }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Conversation Monitoring</h1>
      {err && <div className="text-rose-200 text-sm">{err}</div>}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card-surface p-4 space-y-3">
          <form onSubmit={create} className="flex gap-2"><input className="flex-1 rounded-lg border border-border bg-surface2 px-3 py-2 text-sm" placeholder="New conversation subject" value={subject} onChange={e=>setSubject(e.target.value)} /><button className="btn-primary text-sm">New</button></form>
          <div className="space-y-2">{items.length===0 ? <div className="text-gray-400 text-sm">No conversations.</div> : items.map(c=> <button key={c.id} onClick={()=>open(c.id)} className={`w-full text-left rounded border px-3 py-2 text-sm ${selected===c.id?'border-accent-blue/40 bg-accent-blue/10':'border-border bg-surface2'}`}><div>{c.external_subject||'Conversation'}</div><div className="text-xs text-gray-500">{c.channel} • {c.status}</div></button>)}</div>
        </div>
        <div className="card-surface p-4 lg:col-span-2 space-y-3">
          {!selected ? <div className="text-gray-400 text-sm">Select a conversation to monitor messages. External/user content is treated as untrusted input (not system instructions).</div> : <>
            <div className="max-h-80 overflow-auto space-y-2">{messages.map(m=> <div key={m.id} className="rounded border border-border bg-surface2 p-2 text-sm"><div className="text-xs text-gray-500">{m.sender_type} • {m.created_at}</div><div>{m.content}</div></div>)}</div>
            <form onSubmit={send} className="flex gap-2"><input className="flex-1 rounded-lg border border-border bg-surface2 px-3 py-2" placeholder="Add message (stored for monitoring/history)" value={text} onChange={e=>setText(e.target.value)} /><button className="btn-secondary">Add</button></form>
          </>}
        </div>
      </div>
    </div>
  )
}
