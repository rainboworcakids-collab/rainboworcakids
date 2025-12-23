import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const THAI_STOP_WORDS = ['และ', 'ของ', 'ที่', 'ใน', 'เป็น', 'ได้', 'มี', 'การ', 'กับ', 'แต่']

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { file_url } = await req.json()
    if (!file_url) throw new Error('❌ file_url required')

    // Fetch
    const res = await fetch(file_url)
    if (!res.ok) throw new Error(`❌ HTTP ${res.status}`)
    const html = await res.text()

    // Parse
    const parsed = parseHTML(html)
    const searchVector = generateTSVector(html, parsed)

    // Update DB
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase.from('numerology_search_index').upsert({
      id: parsed.root_number,
      element_type: 'Destiny',
      root_number: parsed.root_number,
      title: parsed.title,
      summary: parsed.summary,
      search_vector: searchVector,
      html_path: file_url.replace('https://raw.githubusercontent.com', '').replace('/main', '')
    }, { onConflict: 'id' }).select('id,title,summary').single()

    if (error) throw error

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

function parseHTML(html: string) {
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.replace(/<.*?>/g, '').trim() || ''
  const num = parseInt(title.match(/เลขศาสตร์ (\d+)/)?.[1] || '0')
  const p = html.match(/<p>([\u0E00-\u0E7F][^<]{50,}?)<\/p>/)?.[1]?.replace(/<.*?>/g, '').trim() || ''
  return { title, root_number: num, summary: p.substring(0, 500) }
}

function generateTSVector(html: string, parsed: any): string {
  const h1 = html.match(/<h1>(.*?)<\/h1>/i)?.[1]?.replace(/<.*?>/g, '').trim() || ''
  const text = (parsed.title + ' ' + parsed.summary + ' ' + h1).split(/\s+/)
  const words = [...new Set(text.filter(w => 
    w.length > 1 && /[\u0E00-\u0E7F]/.test(w) && !THAI_STOP_WORDS.includes(w)
  ))]
  return words.map(w => `'${w.replace(/'/g, "''")}'`).join(' ')
}
