'use client'

import { useState } from 'react'
import { signInWithPassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signInWithPassword(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#FDF9F8] font-sans selection:bg-rose-200">
      
      {/* Kiri: Form Login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10">
        
        {/* Tombol Kembali (Absolute) */}
        <Link href="/" className="absolute top-10 left-8 sm:left-16 lg:left-24 inline-flex items-center text-sm font-medium text-slate-500 hover:text-[#b88e4f] transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
        </Link>

        <div className="max-w-md w-full mx-auto mt-20 lg:mt-0">
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-[#b88e4f]" />
              <span className="text-2xl font-serif text-slate-900 tracking-wider">Elleira.</span>
            </div>
            <h1 className="text-4xl font-serif text-slate-900 mb-3">Selamat Datang</h1>
            <p className="text-slate-500">Silakan masuk ke akun Anda untuk mengelola jadwal perawatan kecantikan.</p>
          </div>

          <form action={onSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-100 text-sm text-red-600 font-medium flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-slate-500">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="nama@email.com" 
                required 
                className="h-12 border-rose-900/10 focus-visible:ring-[#b88e4f] focus-visible:border-[#b88e4f] rounded-xl bg-white shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest text-slate-500">Password</Label>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="h-12 border-rose-900/10 focus-visible:ring-[#b88e4f] focus-visible:border-[#b88e4f] rounded-xl bg-white shadow-sm"
              />
            </div>

            <Button type="submit" className="w-full h-14 rounded-xl bg-[#b88e4f] hover:bg-[#a67d40] text-white uppercase tracking-widest text-xs font-bold shadow-lg shadow-[#b88e4f]/30 transition-all hover:scale-[1.02]" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk Sekarang'
              )}
            </Button>
            
            <div className="text-center text-sm text-slate-500 mt-8 pt-6 border-t border-rose-900/10">
              Belum memiliki akun?{' '}
              <Link href="/register" className="font-semibold text-[#b88e4f] hover:text-[#a67d40] transition-colors hover:underline underline-offset-4">
                Daftar Gratis
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Kanan: Visual Image (Tersembunyi di Mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#ebd3d3]/80 via-transparent to-transparent z-10"></div>
        <Image 
          src="/hero_new_salon.png"
          alt="Luxury Salon Interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-16 left-16 right-16 z-20 text-center">
          <p className="text-white font-serif text-3xl mb-4 leading-tight shadow-sm drop-shadow-md">
            "Keindahan sejati bermula dari momen Anda meluangkan waktu untuk diri sendiri."
          </p>
        </div>
      </div>
      
    </div>
  )
}
