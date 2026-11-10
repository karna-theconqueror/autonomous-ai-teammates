import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

type Point = { name: string; value: number }
export function AnalyticsChart({ title, data }: { title: string; data: Point[] }) {
  return (
    <div className="card-surface p-4">
      <h2 className="font-medium mb-3">{title}</h2>
      {data.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-gray-400 border border-dashed border-border rounded-lg">
          No chart data available. Connect real task/performance records to populate analytics.
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#243044" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
