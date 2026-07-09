'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <Button variant="secondary" className="gap-2" onClick={() => window.print()}>
      <Printer className="w-4 h-4" /> Cetak / PDF
    </Button>
  )
}
