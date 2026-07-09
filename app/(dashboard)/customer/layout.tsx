import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Sparkles, LogOut, Home, Calendar, Clock, User } from 'lucide-react'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDF9F8] font-sans selection:bg-rose-200">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#b88e4f]" />
              <span className="text-2xl font-serif text-slate-900 tracking-wider">Elleira.</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/customer/dashboard" className="text-sm uppercase tracking-widest text-slate-600 hover:text-[#b88e4f] font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/customer/booking" className="text-sm uppercase tracking-widest text-slate-600 hover:text-[#b88e4f] font-medium transition-colors">
                Reservasi
              </Link>
              <Link href="/customer/waitlist" className="text-sm uppercase tracking-widest text-slate-600 hover:text-[#b88e4f] font-medium transition-colors">
                Waitlist
              </Link>
              <Link href="/customer/profile" className="text-sm uppercase tracking-widest text-slate-600 hover:text-[#b88e4f] font-medium transition-colors">
                Profil
              </Link>
            </div>

            {/* Logout Button */}
            <div className="hidden md:flex items-center">
              <form action={signOut}>
                <button type="submit" className="text-sm uppercase tracking-widest flex items-center text-rose-500 hover:text-rose-700 transition-colors font-medium">
                  Keluar <LogOut className="w-4 h-4 ml-2" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32 md:pb-10">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Floating) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 bg-white rounded-full shadow-2xl shadow-rose-900/20 border border-slate-100 flex justify-between items-center px-6 py-4 z-50">
        <Link href="/customer/dashboard" className="flex flex-col items-center text-slate-400 hover:text-[#b88e4f]">
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </Link>
        <Link href="/customer/booking" className="flex flex-col items-center text-slate-400 hover:text-[#b88e4f]">
          <Calendar className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Book</span>
        </Link>
        <Link href="/customer/waitlist" className="flex flex-col items-center text-slate-400 hover:text-[#b88e4f]">
          <Clock className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Wait</span>
        </Link>
        <Link href="/customer/profile" className="flex flex-col items-center text-slate-400 hover:text-[#b88e4f]">
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Profil</span>
        </Link>
        <form action={signOut} className="flex">
          <button type="submit" className="flex flex-col items-center text-rose-400 hover:text-rose-600">
            <LogOut className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Keluar</span>
          </button>
        </form>
      </div>

    </div>
  )
}
