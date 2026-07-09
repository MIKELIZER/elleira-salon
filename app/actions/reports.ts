'use server'

import { createSupabaseServerClient } from './auth'
import { format, subDays, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns'

export async function getDashboardMetrics(
  dateFilter: 'today' | '7days' | '30days' | 'all' = '30days',
  staffId?: string
) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Auth check (Admin only)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('auth_user_id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Akses ditolak.' }

    // Hitung range tanggal
    const now = new Date()
    let startDate = startOfDay(now)
    let endDate = endOfDay(now)
    
    if (dateFilter === '7days') {
      startDate = startOfDay(subDays(now, 7))
    } else if (dateFilter === '30days') {
      startDate = startOfDay(subDays(now, 30))
    } else if (dateFilter === 'all') {
      startDate = new Date(0) // Awal waktu
    }

    // Bangun Query untuk tabel bookings
    let query = supabase
      .from('bookings')
      .select('id, start_at, status, service_id, services(name, price)')
      .gte('start_at', startDate.toISOString())
      .lte('start_at', endDate.toISOString())
      
    if (staffId && staffId !== 'all') {
      query = query.eq('staff_id', staffId)
    }

    const { data: bookings, error } = await query

    if (error) throw error

    // Kalkulasi Metrik
    let totalRevenue = 0
    let totalBookings = bookings?.length || 0
    let completedBookings = 0
    let cancelledBookings = 0
    let pendingBookings = 0

    // Data untuk grafik tren (kelompokkan per hari)
    const revenueByDate: Record<string, number> = {}
    
    // Data untuk layanan populer
    const serviceCount: Record<string, { name: string, count: number, revenue: number }> = {}

    bookings?.forEach((b: any) => {
      // Hitung status
      if (b.status === 'completed') completedBookings++
      else if (b.status === 'cancelled') cancelledBookings++
      else pendingBookings++

      // Hitung pendapatan (hanya dari yang completed)
      if (b.status === 'completed' && b.services?.price) {
        totalRevenue += b.services.price
        
        // Agregasi grafik per hari
        const dateStr = format(new Date(b.start_at), 'yyyy-MM-dd')
        revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + b.services.price
      }

      // Agregasi layanan
      if (b.status !== 'cancelled' && b.services) {
        if (!serviceCount[b.service_id]) {
          serviceCount[b.service_id] = { name: b.services.name, count: 0, revenue: 0 }
        }
        serviceCount[b.service_id].count++
        if (b.status === 'completed') {
          serviceCount[b.service_id].revenue += b.services.price
        }
      }
    })

    // Format data grafik agar urut berdasar tanggal
    const chartData = Object.keys(revenueByDate)
      .sort()
      .map(date => ({
        date,
        pendapatan: revenueByDate[date]
      }))

    // Format data layanan populer (Top 5)
    const popularServices = Object.values(serviceCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      data: {
        totalRevenue,
        totalBookings,
        completedBookings,
        cancelledBookings,
        pendingBookings,
        chartData,
        popularServices
      }
    }
  } catch (err: any) {
    return { error: err.message }
  }
}
