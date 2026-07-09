'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { 
  LayoutDashboard, 
  Scissors, 
  Users, 
  CalendarCheck, 
  LogOut,
  Sparkles
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Layanan', href: '/admin/services', icon: Scissors },
    { name: 'Staf', href: '/admin/staff', icon: Users },
    { name: 'Semua Pesanan', href: '/admin/bookings', icon: CalendarCheck },
  ]

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans">
      
      {/* Sidebar - Modern SaaS Style */}
      <aside className="w-64 bg-white border-r border-slate-200/60 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-serif text-slate-900 tracking-wide font-bold">Elleira.</h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">Admin Portal</p>
          </div>
        </div>
        
        <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 mt-2 px-3">Menu Utama</div>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-5 border-t border-slate-100 bg-slate-50/50">
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-700 transition-colors group text-sm font-medium">
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 pb-32 md:pb-12 max-w-7xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-serif text-slate-900 tracking-wide font-bold leading-tight">Elleira.</h2>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Admin</p>
            </div>
          </div>
        </div>
        
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900 rounded-full shadow-2xl flex justify-around items-center p-2 z-50">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className="relative p-3">
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>}
            </Link>
          )
        })}
        <form action={signOut}>
          <button type="submit" className="p-3 text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  )
}
