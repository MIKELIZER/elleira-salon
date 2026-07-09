'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardMetrics } from '@/app/actions/reports'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Loader2, DollarSign, CalendarCheck, XCircle, Clock } from 'lucide-react'

type Staff = { id: string, full_name: string }

export default function DashboardClient({ staffList }: { staffList: Staff[] }) {
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days' | 'all'>('30days')
  const [staffFilter, setStaffFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)
      const res = await getDashboardMetrics(dateFilter, staffFilter)
      if (res.error) {
        setError(res.error)
      } else {
        setMetrics(res.data)
      }
      setLoading(false)
    }
    fetchMetrics()
  }, [dateFilter, staffFilter])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif text-slate-900 font-bold tracking-tight">Kinerja Salon</h1>
        <p className="text-slate-500 mt-1">Pantau statistik dan pendapatan secara real-time.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="h-10 w-full sm:w-48 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
            >
              <option value="today">Hari Ini</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
              <option value="all">Sepanjang Waktu</option>
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <select 
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="h-10 w-full sm:w-48 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
            >
              <option value="all">Semua Staf</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>{staff.full_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
        </div>
      ) : metrics ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendapatan</p>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{formatCurrency(metrics.totalRevenue)}</h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selesai</p>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{metrics.completedBookings}</h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tertunda</p>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{metrics.pendingBookings}</h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batal</p>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{metrics.cancelledBookings}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 lg:col-span-2 flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Tren Pendapatan</h3>
                <p className="text-sm text-slate-500">Statistik pergerakan pendapatan kotor.</p>
              </div>
              
              <div className="h-[300px] w-full flex-1">
                {metrics.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(val) => {
                          const d = new Date(val)
                          return `${d.getDate()}/${d.getMonth()+1}`
                        }}
                        stroke="#94a3b8" 
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        tickFormatter={(val) => `Rp ${val / 1000}k`}
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [formatCurrency(value), 'Pendapatan']}
                        labelFormatter={(label) => `Tanggal: ${label}`}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar 
                        dataKey="pendapatan" 
                        fill="#0f172a" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                    Belum ada data pendapatan di rentang waktu ini.
                  </div>
                )}
              </div>
            </div>

            {/* Popular Services */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Layanan Terpopuler</h3>
                <p className="text-sm text-slate-500">Berdasarkan jumlah pesanan.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {metrics.popularServices.length > 0 ? (
                  <div className="space-y-5">
                    {metrics.popularServices.map((svc: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-slate-700 transition-colors">{svc.name}</div>
                            <div className="text-[11px] text-slate-500 uppercase tracking-widest mt-0.5">{svc.count} x Dipesan</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                          {formatCurrency(svc.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-400 text-sm">
                    Tidak ada data layanan.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : null}
    </div>
  )
}
