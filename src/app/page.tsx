'use client'

import { useState, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Invoice {
  id: string
  client: string
  invoiceNumber: string
  dueDate: string
  amount: number
  daysOverdue: number
  status: 'current' | 'overdue' | 'critical'
  industry: string
}

interface UploadedFile {
  name: string
  size: number
  type: string
}

const INVOICES: Invoice[] = [
  { id: '1',  client: 'Meridian Construction LLC',   invoiceNumber: 'INV-2024-0341', dueDate: '2024-10-31', amount: 48500,  daysOverdue: 76,  status: 'critical',  industry: 'Construction' },
  { id: '2',  client: 'BlueStar Marketing Group',    invoiceNumber: 'INV-2024-0355', dueDate: '2024-11-14', amount: 12750,  daysOverdue: 62,  status: 'critical',  industry: 'Marketing' },
  { id: '3',  client: 'Apex Industrial Supply',      invoiceNumber: 'INV-2024-0362', dueDate: '2024-11-21', amount: 31200,  daysOverdue: 55,  status: 'critical',  industry: 'Manufacturing' },
  { id: '4',  client: 'Greenfield Technologies',     invoiceNumber: 'INV-2024-0378', dueDate: '2024-12-01', amount: 9800,   daysOverdue: 45,  status: 'overdue',   industry: 'Tech' },
  { id: '5',  client: 'Coastal Realty Partners',     invoiceNumber: 'INV-2024-0390', dueDate: '2024-12-08', amount: 22400,  daysOverdue: 38,  status: 'overdue',   industry: 'Real Estate' },
  { id: '6',  client: 'Pinnacle Law Associates',     invoiceNumber: 'INV-2024-0401', dueDate: '2024-12-15', amount: 7650,   daysOverdue: 31,  status: 'overdue',   industry: 'Legal' },
  { id: '7',  client: 'Harmony Health Solutions',    invoiceNumber: 'INV-2024-0415', dueDate: '2024-12-20', amount: 18900,  daysOverdue: 26,  status: 'overdue',   industry: 'Healthcare' },
  { id: '8',  client: 'TechForge Innovations',       invoiceNumber: 'INV-2024-0428', dueDate: '2024-12-25', amount: 5500,   daysOverdue: 21,  status: 'overdue',   industry: 'Tech' },
  { id: '9',  client: 'Riverbend Logistics Co.',     invoiceNumber: 'INV-2024-0435', dueDate: '2024-12-31', amount: 14200,  daysOverdue: 15,  status: 'overdue',   industry: 'Logistics' },
  { id: '10', client: 'Sterling Media Productions',  invoiceNumber: 'INV-2024-0442', dueDate: '2025-01-04', amount: 8300,   daysOverdue: 11,  status: 'overdue',   industry: 'Media' },
  { id: '11', client: 'Vanguard Consulting Group',   invoiceNumber: 'INV-2024-0448', dueDate: '2025-01-09', amount: 27600,  daysOverdue: 6,   status: 'overdue',   industry: 'Consulting' },
  { id: '12', client: 'NovaBuild Engineering',       invoiceNumber: 'INV-2024-0453', dueDate: '2025-01-11', amount: 41000,  daysOverdue: 4,   status: 'overdue',   industry: 'Engineering' },
  { id: '13', client: 'Cascade Software Labs',       invoiceNumber: 'INV-2025-0001', dueDate: '2025-01-14', amount: 3200,   daysOverdue: 1,   status: 'overdue',   industry: 'Tech' },
  { id: '14', client: 'Summit Financial Services',   invoiceNumber: 'INV-2025-0008', dueDate: '2025-01-17', amount: 15700,  daysOverdue: 0,   status: 'current',   industry: 'Finance' },
  { id: '15', client: 'Horizon Retail Solutions',    invoiceNumber: 'INV-2025-0012', dueDate: '2025-01-19', amount: 6850,   daysOverdue: 0,   status: 'current',   industry: 'Retail' },
  { id: '16', client: 'Ironclad Security Systems',   invoiceNumber: 'INV-2025-0017', dueDate: '2025-01-21', amount: 11300,  daysOverdue: 0,   status: 'current',   industry: 'Security' },
  { id: '17', client: 'Pacific Hospitality Group',   invoiceNumber: 'INV-2025-0023', dueDate: '2025-01-25', amount: 19450,  daysOverdue: 0,   status: 'current',   industry: 'Hospitality' },
  { id: '18', client: 'Alpine Energy Partners',      invoiceNumber: 'INV-2025-0029', dueDate: '2025-01-27', amount: 34800,  daysOverdue: 0,   status: 'current',   industry: 'Energy' },
  { id: '19', client: 'MetroCore Architecture',      invoiceNumber: 'INV-2025-0034', dueDate: '2025-02-01', amount: 8100,   daysOverdue: 0,   status: 'current',   industry: 'Architecture' },
  { id: '20', client: 'Redwood Data Systems',        invoiceNumber: 'INV-2025-0039', dueDate: '2025-02-04', amount: 4700,   daysOverdue: 0,   status: 'current',   industry: 'Tech' },
]

function fmt(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

function fileIcon(type: string) {
  if (type.includes('pdf')) return '📄'
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return '📊'
  if (type.includes('word') || type.includes('document')) return '📝'
  if (type.includes('image')) return '🖼️'
  return '📎'
}

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type QBStep = 'login' | 'authorizing' | 'connected'

export default function DemoPage() {
  const [analysis, setAnalysis] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'overdue' | 'critical' | 'current'>('all')
  const [exporting, setExporting] = useState(false)

  // QuickBooks connect modal
  const [qbOpen, setQbOpen] = useState(false)
  const [qbStep, setQbStep] = useState<QBStep>('login')
  const [qbLoading, setQbLoading] = useState(false)

  // File upload
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalOutstanding = INVOICES.reduce((s, i) => s + i.amount, 0)
  const overdue = INVOICES.filter(i => i.daysOverdue > 0)
  const critical = INVOICES.filter(i => i.status === 'critical')
  const totalOverdue = overdue.reduce((s, i) => s + i.amount, 0)
  const current = INVOICES.filter(i => i.status === 'current')
  const filtered = filter === 'all' ? INVOICES : INVOICES.filter(i => i.status === filter)

  // QB OAuth simulation
  function openQB() {
    setQbStep('login')
    setQbOpen(true)
  }

  function handleQBAuthorize() {
    setQbLoading(true)
    setQbStep('authorizing')
    setTimeout(() => {
      setQbStep('connected')
      setQbLoading(false)
    }, 2000)
  }

  // File upload
  function handleFiles(files: FileList | null) {
    if (!files) return
    const accepted = Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }))
    setUploadedFiles(prev => [...prev, ...accepted])
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  async function runAnalysis() {
    setLoading(true)
    setAnalysis('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoices: INVOICES }),
      })
      const data = await res.json()
      setAnalysis(data.analysis || data.error || 'No response')
    } catch {
      setAnalysis('Error connecting to AI service.')
    } finally {
      setLoading(false)
    }
  }

  async function exportPDF() {
    setExporting(true)
    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
      const doc = await PDFDocument.create()
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const bold = await doc.embedFont(StandardFonts.HelveticaBold)

      const addPage = () => doc.addPage([595, 842])
      let page = addPage()
      const { width, height } = page.getSize()
      let y = height - 50

      const draw = (text: string, x: number, yPos: number, size = 10, f = font, color = rgb(0.1, 0.1, 0.1)) => {
        page.drawText(text, { x, y: yPos, size, font: f, color })
      }

      page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: rgb(0.07, 0.34, 0.71) })
      draw('QuickBooks AI Invoice Analyzer', 40, height - 35, 18, bold, rgb(1, 1, 1))
      draw(`Outstanding Invoice Report — ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 40, height - 58, 10, font, rgb(0.8, 0.9, 1))
      y = height - 105

      const boxes = [
        { label: 'Total Outstanding', value: fmt(totalOutstanding), color: rgb(0.07, 0.34, 0.71) },
        { label: 'Overdue Amount', value: fmt(totalOverdue), color: rgb(0.8, 0.2, 0.2) },
        { label: 'Overdue Invoices', value: `${overdue.length} of ${INVOICES.length}`, color: rgb(0.85, 0.45, 0) },
        { label: 'Critical (60+ days)', value: `${critical.length} invoices`, color: rgb(0.5, 0, 0) },
      ]
      const bw = (width - 80) / 4
      boxes.forEach((b, i) => {
        const bx = 40 + i * (bw + 5)
        page.drawRectangle({ x: bx, y: y - 55, width: bw - 5, height: 55, color: b.color, opacity: 0.1, borderColor: b.color, borderWidth: 1 })
        draw(b.label, bx + 6, y - 18, 7.5, font, b.color)
        draw(b.value, bx + 6, y - 38, 12, bold, b.color)
      })
      y -= 75

      if (analysis) {
        draw('AI Executive Analysis', 40, y, 12, bold, rgb(0.07, 0.34, 0.71))
        y -= 8
        page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.07, 0.34, 0.71), opacity: 0.3 })
        y -= 16
        const words = analysis.split(' ')
        let line = ''
        for (const word of words) {
          const test = line ? `${line} ${word}` : word
          if (font.widthOfTextAtSize(test, 9) > width - 80 && line) {
            if (y < 60) { page = addPage(); y = height - 50 }
            draw(line, 40, y, 9)
            y -= 14
            line = word
          } else { line = test }
        }
        if (line) { draw(line, 40, y, 9); y -= 14 }
        y -= 10
      }

      if (y < 150) { page = addPage(); y = height - 50 }
      draw('Invoice Detail', 40, y, 12, bold, rgb(0.07, 0.34, 0.71))
      y -= 8
      page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.07, 0.34, 0.71), opacity: 0.3 })
      y -= 16
      page.drawRectangle({ x: 40, y: y - 16, width: width - 80, height: 18, color: rgb(0.07, 0.34, 0.71) })
      const cols = [40, 155, 275, 360, 435, 505]
      ;['Client', 'Invoice #', 'Due Date', 'Amount', 'Days OD', 'Status'].forEach((h, i) => draw(h, cols[i] + 4, y - 12, 8, bold, rgb(1, 1, 1)))
      y -= 20

      for (const inv of INVOICES) {
        if (y < 50) { page = addPage(); y = height - 50 }
        const sc = inv.status === 'critical' ? rgb(0.7, 0, 0) : inv.status === 'overdue' ? rgb(0.75, 0.35, 0) : rgb(0.1, 0.55, 0.1)
        const row = [inv.client.slice(0, 22), inv.invoiceNumber, inv.dueDate, fmt(inv.amount), inv.daysOverdue > 0 ? `${inv.daysOverdue}d` : '—', inv.status.toUpperCase()]
        row.forEach((v, i) => draw(v, cols[i] + 4, y, 8, i === 5 ? bold : font, i === 5 ? sc : rgb(0.15, 0.15, 0.15)))
        y -= 14
        page.drawLine({ start: { x: 40, y: y + 2 }, end: { x: width - 40, y: y + 2 }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) })
      }

      doc.getPages().forEach((p, i, arr) => {
        p.drawText(`Generated by QuickBooks AI Analyzer · Page ${i + 1} of ${arr.length}`, { x: 40, y: 20, size: 7.5, font, color: rgb(0.5, 0.5, 0.5) })
      })

      const bytes = await doc.save()
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-report-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const statusBadge = (status: Invoice['status']) => {
    if (status === 'critical') return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Critical</Badge>
    if (status === 'overdue') return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Overdue</Badge>
    return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Current</Badge>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">QB</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Invoice Analyzer</h1>
              <p className="text-xs text-slate-500">Powered by AI · QuickBooks Integration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
              ↑ Upload File
            </Button>
            <Button variant="outline" size="sm" onClick={openQB} className="border-[#2CA01C] text-[#2CA01C] hover:bg-green-50">
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
              Connect QuickBooks
            </Button>
            <Button variant="outline" size="sm" onClick={exportPDF} disabled={exporting}>
              {exporting ? 'Generating…' : '↓ Export PDF'}
            </Button>
            <Button size="sm" onClick={runAnalysis} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Analyzing…' : '✦ AI Analysis'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Outstanding</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4"><p className="text-2xl font-bold text-slate-900">{fmt(totalOutstanding)}</p><p className="text-xs text-slate-400 mt-1">{INVOICES.length} invoices</p></CardContent>
          </Card>
          <Card className="border-red-100 bg-red-50/40">
            <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs font-medium text-red-500 uppercase tracking-wide">Overdue Amount</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4"><p className="text-2xl font-bold text-red-600">{fmt(totalOverdue)}</p><p className="text-xs text-red-400 mt-1">{overdue.length} invoices past due</p></CardContent>
          </Card>
          <Card className="border-amber-100 bg-amber-50/40">
            <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs font-medium text-amber-600 uppercase tracking-wide">Critical (60+ days)</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4"><p className="text-2xl font-bold text-amber-700">{fmt(critical.reduce((s, i) => s + i.amount, 0))}</p><p className="text-xs text-amber-500 mt-1">{critical.length} invoices</p></CardContent>
          </Card>
          <Card className="border-green-100 bg-green-50/40">
            <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs font-medium text-green-600 uppercase tracking-wide">Current (On Time)</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4"><p className="text-2xl font-bold text-green-700">{fmt(current.reduce((s, i) => s + i.amount, 0))}</p><p className="text-xs text-green-500 mt-1">{current.length} invoices</p></CardContent>
          </Card>
        </div>

        {/* AI Analysis */}
        {(analysis || loading) && (
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                <span className="text-blue-600">✦</span> AI Executive Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-3 text-blue-600 text-sm">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Analyzing {INVOICES.length} invoices with Llama 3.3 70B…
                </div>
              ) : (
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{analysis}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Invoice Table */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">Outstanding Invoices</CardTitle>
              <div className="flex gap-1.5">
                {(['all', 'critical', 'overdue', 'current'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                    {f === 'all' ? `All (${INVOICES.length})` : f === 'critical' ? `Critical (${critical.length})` : f === 'overdue' ? `Overdue (${overdue.length})` : `Current (${current.length})`}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50">
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-6 py-3">Client</th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Invoice #</th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Due Date</th>
                    <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Amount</th>
                    <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Days OD</th>
                    <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv, idx) => (
                    <tr key={inv.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${idx % 2 !== 0 ? 'bg-slate-50/30' : ''}`}>
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-800">{inv.client}</div>
                        <div className="text-xs text-slate-400">{inv.industry}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{fmt(inv.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        {inv.daysOverdue > 0
                          ? <span className={`font-semibold ${inv.daysOverdue >= 60 ? 'text-red-600' : 'text-amber-600'}`}>{inv.daysOverdue}d</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">{statusBadge(inv.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 pb-4">
          Demo · Data is illustrative · AI analysis via Groq Llama 3.3 70B · Built with Next.js &amp; QuickBooks API
        </p>
      </main>

      {/* QuickBooks Connect Modal */}
      <Dialog open={qbOpen} onOpenChange={open => { setQbOpen(open); if (!open) setQbStep('login') }}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {qbStep === 'login' && (
            <div>
              <div className="bg-[#2CA01C] px-6 py-5 flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-[#2CA01C] font-bold text-sm">QB</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">QuickBooks Online</p>
                  <p className="text-green-100 text-xs">Intuit Inc.</p>
                </div>
              </div>
              <div className="px-6 py-6 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-base">Sign in to QuickBooks</DialogTitle>
                  <p className="text-xs text-slate-500">Invoice Analyzer is requesting access to your QuickBooks data</p>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Email or user ID</label>
                    <input defaultValue="demo@company.com" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Password</label>
                    <input type="password" defaultValue="••••••••" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                <Button onClick={handleQBAuthorize} className="w-full bg-[#2CA01C] hover:bg-[#238016] text-white">
                  Sign In & Authorize
                </Button>
                <p className="text-center text-xs text-slate-400">
                  Secure OAuth 2.0 connection · No password stored
                </p>
              </div>
            </div>
          )}

          {qbStep === 'authorizing' && (
            <div className="px-6 py-12 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-green-200 border-t-[#2CA01C] rounded-full animate-spin" />
              <div className="text-center">
                <p className="font-medium text-slate-800 text-sm">Connecting to QuickBooks…</p>
                <p className="text-xs text-slate-400 mt-1">Fetching your company data securely</p>
              </div>
            </div>
          )}

          {qbStep === 'connected' && (
            <div className="px-6 py-8 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-800">QuickBooks Connected!</p>
                <p className="text-xs text-slate-500 mt-1">Company: <span className="font-medium">Acme Corp LLC</span></p>
                <p className="text-xs text-slate-500">Synced <span className="font-medium">20 outstanding invoices</span> · Last updated just now</p>
              </div>
              <div className="w-full bg-slate-50 rounded-lg p-3 text-left space-y-1.5">
                <p className="text-xs font-medium text-slate-600">Access granted:</p>
                <p className="text-xs text-slate-500">✓ Read invoices &amp; customers</p>
                <p className="text-xs text-slate-500">✓ Read accounts receivable</p>
                <p className="text-xs text-slate-500">✓ Read financial reports</p>
              </div>
              <Button onClick={() => setQbOpen(false)} className="w-full bg-[#2CA01C] hover:bg-[#238016] text-white">
                Start Analyzing
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload File Modal */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Upload Documents</DialogTitle>
            <p className="text-xs text-slate-500">Upload invoices, statements, or reports to include in the analysis</p>
          </DialogHeader>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
          >
            <div className="text-3xl mb-2">📂</div>
            <p className="text-sm font-medium text-slate-700">Drop files here or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">PDF, Excel (.xlsx), Word (.docx), Images (PNG, JPG)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg,.csv"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>

          {/* File list */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded</p>
              {uploadedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-xl">{fileIcon(f.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{f.name}</p>
                    <p className="text-xs text-slate-400">{fileSize(f.size)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs">Ready</span>
                  </div>
                  <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))} className="text-slate-300 hover:text-slate-500 text-lg leading-none">×</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setUploadOpen(false)} disabled={uploadedFiles.length === 0}>
              {uploadedFiles.length > 0 ? `Process ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}` : 'Upload Files'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
