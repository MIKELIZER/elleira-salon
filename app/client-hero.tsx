'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function ClientHero({ isLoggedIn, dashboardUrl }: { isLoggedIn: boolean, dashboardUrl: string }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 10 } }
  }

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-[#FDF9F8]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
            className="lg:col-span-5 text-center lg:text-left pt-10"
          >
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-serif text-slate-900 leading-[1.1] mb-6">
              Embrace <br/>
              <span className="italic text-rose-300">True</span><br/>
              Beauty.
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg text-slate-500 mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed font-light">
              Rasakan perpaduan sempurna antara teknik penataan mutakhir dan nuansa relaksasi absolut. Sebuah mahakarya pelayanan hanya untuk Anda.
            </motion.p>
            
            <motion.div variants={itemVariants}>
              <Link href={isLoggedIn ? dashboardUrl : '/login'}>
                <Button className="bg-transparent border border-[#b88e4f] text-[#b88e4f] hover:bg-[#b88e4f] hover:text-white rounded-none px-10 h-14 uppercase tracking-[0.2em] text-xs transition-colors duration-500">
                  Reservasi
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            className="relative lg:col-span-7 h-[500px] lg:h-[700px] w-full"
          >
            {/* The asymmetrical image container */}
            <div className="absolute inset-0 right-0 lg:-right-12 rounded-tl-[100px] rounded-bl-[20px] rounded-tr-[20px] rounded-br-[100px] overflow-hidden shadow-2xl">
              <Image 
                src="/hero_new_salon.png" 
                alt="Elleira Salon Interior" 
                fill
                className="object-cover scale-105 hover:scale-100 transition-transform duration-[2000ms]"
                priority
              />
            </div>
            
            {/* Floating Glass Bar typical of Snails */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute -bottom-6 left-10 right-10 lg:-left-12 lg:right-24 bg-white/70 backdrop-blur-md p-6 border-l-4 border-[#b88e4f] shadow-lg flex justify-between items-center"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Promo Bulan Ini</p>
                <p className="font-serif text-lg text-slate-900">Spa Premium Diskon 20%</p>
              </div>
              <Link href="/login" className="text-xs uppercase tracking-widest font-bold text-[#b88e4f] hover:text-slate-900 transition-colors">
                Klaim Sekarang &rarr;
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-20 w-1/3 h-full bg-[#ebd3d3]/30"></div>
    </section>
  )
}
