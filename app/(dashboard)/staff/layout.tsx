import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { Sparkles, Calendar, Clock, LogOut } from 'lucide-react'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#FDF9F8] font-sans">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-r border-rose-900/10 flex flex-col hidden md:flex">
        <div className="p-8 border-b border-rose-900/10 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#b88e4f]" />
          <div>
            <h2 className="text-xl font-serif text-slate-900 tracking-wider">Elleira.</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#b88e4f] font-bold">Staff Portal</p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-4">
          <Link href="/staff/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-slate-700 hover:text-[#b88e4f] font-medium transition-colors group">
            <Clock className="w-5 h-5 text-slate-400 group-hover:text-[#b88e4f] transition-colors" />
            Jadwal Harian
          </Link>
          <Link href="/staff/bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-slate-700 hover:text-[#b88e4f] font-medium transition-colors group">
            <Calendar className="w-5 h-5 text-slate-400 group-hover:text-[#b88e4f] transition-colors" />
            Riwayat Pesanan
          </Link>
        </nav>
        
        <div className="p-6 border-t border-rose-900/10">
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-700 transition-colors group">
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
              <span className="font-medium">Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 pb-32 md:pb-12 max-w-7xl">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-rose-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#b88e4f]" />
            <h2 className="text-lg font-serif text-slate-900 tracking-wider">Elleira. <span className="text-[10px] font-sans uppercase tracking-widest text-[#b88e4f] font-bold">Staff</span></h2>
          </div>
        </div>
        
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 bg-white rounded-full shadow-xl shadow-rose-900/10 border border-slate-100 flex justify-around items-center p-2 z-50">
        <Link href="/staff/dashboard" className="flex flex-col items-center p-3 text-slate-400 hover:text-[#b88e4f]">
          <Clock className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Dashboard</span>
        </Link>
        <Link href="/staff/bookings" className="flex flex-col items-center p-3 text-slate-400 hover:text-[#b88e4f]">
          <Calendar className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Pesanan</span>
        </Link>
        <form action={signOut}>
          <button type="submit" className="flex flex-col items-center p-3 text-rose-400 hover:text-rose-600">
            <LogOut className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Keluar</span>
          </button>
        </form>
      </div>

    </div>
  )
}
