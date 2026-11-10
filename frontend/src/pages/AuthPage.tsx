import { useState } from 'react'
import { supabaseConfigured } from '../lib/supabase'

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  return (
    <div className="min-h-screen bg-background bg-hero-grid flex items-center justify-center p-6">
      <div className="card-surface w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold mb-1">{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
        <p className="text-sm text-gray-400 mb-6">Supabase Auth integration scaffold. Configure environment variables to enable live authentication.</p>
        {!supabaseConfigured && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            Supabase is not configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>frontend/.env</code>.
          </div>
        )}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <label className="block text-sm">
            <span className="text-gray-300">Email</span>
            <input className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2 outline-none focus:border-accent-blue" type="email" placeholder="you@company.com" />
          </label>
          <label className="block text-sm">
            <span className="text-gray-300">Password</span>
            <input className="mt-1 w-full rounded-lg border border-border bg-surface2 px-3 py-2 outline-none focus:border-accent-blue" type="password" placeholder="••••••••" />
          </label>
          <button className="btn-primary w-full" type="submit" disabled={!supabaseConfigured}>
            {supabaseConfigured ? (mode === 'signin' ? 'Sign in' : 'Sign up') : 'Configure Supabase to continue'}
          </button>
        </form>
        <button className="mt-4 text-sm text-accent-blue hover:underline" onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}>
          {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
