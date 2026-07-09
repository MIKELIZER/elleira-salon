import { createSupabaseServerClient } from '@/app/actions/auth'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sparkles, Star, Scissors, Flower2, HeartHandshake } from 'lucide-react'
import { ClientHero } from './client-hero'

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let dashboardUrl = '/login'
  let isLoggedIn = false

  if (user) {
    isLoggedIn = true
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()
    
    const role = profile?.role || 'customer'
    dashboardUrl = `/${role}/dashboard`
  }

  return (
    <div className="min-h-screen bg-[#FDF9F8] selection:bg-rose-200 font-sans">
      {/* Elegant Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between h-24 items-center border-b border-rose-900/10">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-serif text-slate-900 tracking-wider">Elleira.</span>
            </div>
            <div className="hidden md:flex space-x-12">
              <Link href="#layanan" className="text-sm uppercase tracking-widest text-slate-700 hover:text-rose-600 transition-colors">Layanan</Link>
              <Link href="#tentang" className="text-sm uppercase tracking-widest text-slate-700 hover:text-rose-600 transition-colors">Tentang Kami</Link>
              <Link href="#testimoni" className="text-sm uppercase tracking-widest text-slate-700 hover:text-rose-600 transition-colors">Testimoni</Link>
            </div>
            <div>
              <Link href={isLoggedIn ? dashboardUrl : '/login'}>
                <Button className="bg-[#b88e4f] hover:bg-[#a67d40] text-white rounded-none px-8 h-12 uppercase tracking-widest text-xs">
                  {isLoggedIn ? 'Dashboard' : 'Book Now'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <ClientHero isLoggedIn={isLoggedIn} dashboardUrl={dashboardUrl} />

      {/* Stats & About Minimalist Section */}
      <section id="tentang" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex gap-1 mb-6 text-[#b88e4f]">
              {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-current" />)}
            </div>
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6 leading-tight">
              Mendefinisikan Ulang<br/>
              Kecantikan <span className="italic text-rose-300">Modern</span>.
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Elleira didirikan dengan filosofi sederhana: setiap wanita berhak merasa cantik tanpa mengorbankan kesehatan alami tubuhnya. Kami menggunakan produk organik dan teknik terdepan di industri.
            </p>
            <div className="grid grid-cols-2 gap-8 border-t border-rose-100 pt-8">
              <div>
                <h4 className="text-4xl font-serif text-[#b88e4f]">10+</h4>
                <p className="text-sm uppercase tracking-wider text-slate-500 mt-2">Tahun Pengalaman</p>
              </div>
              <div>
                <h4 className="text-4xl font-serif text-[#b88e4f]">5k+</h4>
                <p className="text-sm uppercase tracking-wider text-slate-500 mt-2">Klien Puas</p>
              </div>
            </div>
          </div>
          <div className="relative">
            {/* Overlapping Circle Collage Effect */}
            <div className="relative aspect-square max-w-md ml-auto">
              <div className="absolute inset-0 rounded-full bg-[#ebd3d3]/40 -translate-x-8 translate-y-8"></div>
              <div className="absolute inset-0 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                <Image src="/service_spa.png" alt="Spa Relax" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl">
                <Image src="/service_nails.png" alt="Nail Art" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Asymmetrical Color Blocks */}
      <section className="flex flex-col md:flex-row w-full">
        <div className="flex-1 bg-[#f4f6f8] p-16 lg:p-24 text-center">
          <Scissors className="w-10 h-10 mx-auto text-slate-700 mb-6" />
          <h3 className="text-2xl font-serif mb-4">Profesional</h3>
          <p className="text-slate-600">Stylist bersertifikat internasional dengan jam terbang tinggi.</p>
        </div>
        <div className="flex-1 bg-[#b88e4f] p-16 lg:p-24 text-center text-white">
          <Sparkles className="w-10 h-10 mx-auto text-white mb-6" />
          <h3 className="text-2xl font-serif mb-4">Kualitas Premium</h3>
          <p className="text-white/90">Hanya menggunakan bahan organik dan produk top tier.</p>
        </div>
        <div className="flex-1 bg-[#f4f6f8] p-16 lg:p-24 text-center">
          <HeartHandshake className="w-10 h-10 mx-auto text-slate-700 mb-6" />
          <h3 className="text-2xl font-serif mb-4">Kenyamanan</h3>
          <p className="text-slate-600">Ambiance salon yang menenangkan selayaknya rumah kedua.</p>
        </div>
      </section>

      {/* Overlapping Services Cards (Snails-Inspired) */}
      <section id="layanan" className="py-24 bg-[#FDF9F8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-4">Layanan Kami</h2>
            <div className="w-24 h-1 bg-[#b88e4f] mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { title: 'Hair Treatment', img: '/service_hair.png', desc: 'Perawatan rambut mendalam untuk kilau alami maksimal.' },
              { title: 'Nail Art & Spa', img: '/service_nails.png', desc: 'Manicure dan pedicure presisi dengan sentuhan seni.' },
              { title: 'Body Relaxation', img: '/service_spa.png', desc: 'Lepaskan penat dengan pijatan esensial aromaterapi.' }
            ].map((srv, idx) => (
              <div key={idx} className="group relative pt-64 pb-10">
                {/* Image Background */}
                <div className="absolute top-0 left-0 right-0 h-80 overflow-hidden rounded-t-3xl shadow-lg">
                  <Image src={srv.img} alt={srv.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                {/* Content Box Overlapping */}
                <div className="relative z-10 bg-white mx-6 p-8 rounded-2xl shadow-xl shadow-rose-900/5 translate-y-12 group-hover:-translate-y-2 transition-transform duration-500 text-center">
                  <Flower2 className="w-8 h-8 mx-auto text-[#b88e4f] mb-4" />
                  <h3 className="text-2xl font-serif text-slate-900 mb-3">{srv.title}</h3>
                  <p className="text-slate-600 mb-6 text-sm leading-relaxed">{srv.desc}</p>
                  <Link href={dashboardUrl} className="text-xs font-bold uppercase tracking-widest text-[#b88e4f] hover:text-slate-900 transition-colors">
                    Booking Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="bg-[#ebd3d3]/30 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl font-serif text-slate-900 mb-8">Elleira Beauty</h2>
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <Link href="#layanan" className="text-sm tracking-widest uppercase text-slate-600 hover:text-[#b88e4f] transition-colors">Layanan</Link>
            <Link href="#tentang" className="text-sm tracking-widest uppercase text-slate-600 hover:text-[#b88e4f] transition-colors">Tentang Kami</Link>
            <Link href="#testimoni" className="text-sm tracking-widest uppercase text-slate-600 hover:text-[#b88e4f] transition-colors">Testimoni</Link>
            <Link href={dashboardUrl} className="text-sm tracking-widest uppercase text-[#b88e4f] font-bold hover:text-slate-900 transition-colors">Reservasi</Link>
          </div>
          <div className="border-t border-rose-900/10 pt-8 text-xs tracking-widest uppercase text-slate-500">
            © 2026 Elleira Beauty Salon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
