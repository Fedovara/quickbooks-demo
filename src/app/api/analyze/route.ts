import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { invoices } = await req.json()

  const totalOutstanding = invoices.reduce((sum: number, inv: { amount: number }) => sum + inv.amount, 0)
  const overdue = invoices.filter((inv: { daysOverdue: number }) => inv.daysOverdue > 0)
  const totalOverdue = overdue.reduce((sum: number, inv: { amount: number }) => sum + inv.amount, 0)
  const avgDaysOverdue = overdue.length > 0
    ? Math.round(overdue.reduce((sum: number, inv: { daysOverdue: number }) => sum + inv.daysOverdue, 0) / overdue.length)
    : 0

  const prompt = `You are a senior accounts receivable analyst. Analyze these outstanding invoices and provide a concise executive summary with actionable recommendations.

Data:
- Total outstanding: $${totalOutstanding.toLocaleString()}
- Overdue invoices: ${overdue.length} totaling $${totalOverdue.toLocaleString()}
- Average days overdue: ${avgDaysOverdue} days
- Top overdue clients: ${overdue.slice(0, 3).map((inv: { client: string; amount: number; daysOverdue: number }) => `${inv.client} ($${inv.amount.toLocaleString()}, ${inv.daysOverdue} days)`).join('; ')}

Write 3-4 short paragraphs covering: (1) overall AR health assessment, (2) high-priority collection actions, (3) risk analysis, (4) recommended next steps. Be specific and professional. No bullet points, just flowing analysis.`

  const apiKey = process.env.AI_FALLBACK_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return NextResponse.json({ error: err }, { status: response.status })
  }

  const data = await response.json()
  const analysis = data.choices?.[0]?.message?.content ?? ''
  return NextResponse.json({ analysis })
}
