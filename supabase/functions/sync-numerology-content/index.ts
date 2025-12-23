import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { file_url } = await req.json()
    if (!file_url) throw new Error('❌ file_url required')

    // Fetch HTML
    const res = await fetch(file_url)
    if (!res.ok) throw new Error(`❌ Failed to fetch: HTTP ${res.status}`)
    const html = await res.text()

    // Parse content
    const parsed = parseHTML(html)
    const lifePath = calculateLifePath(parsed.root_number)
    const htmlPath = generateStandardPath(file_url)

    // Update DB (ลบ search_vector ออก)
    const supabase = createClient(
      Deno.env.get('RAINBOW_URL')!,
      Deno.env.get('RAINBOW_ANON_KEY')!
    )

    const { data, error } = await supabase
      .from('numerology_search_index')
      .upsert({
        id: parsed.root_number,
        element_type: 'Destiny',
        root_number: parsed.root_number,
        title: parsed.title,
        summary: parsed.summary,
        html_path: htmlPath
        // ลบ search_vector ออก
      }, { onConflict: 'id' })
      .select('id,title,summary')
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ 
      success: true, 
      data,
      metadata: {
        root_number: parsed.root_number,
        life_path: lifePath,
        html_path: htmlPath
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (err) {
    console.error('💥 Error:', err.message) // ✅ เพิ่ม log
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

// ✅ คำนวณ Life Path Number จาก PHP
function calculateLifePath(num: number): number {
  let sum = num
  while (sum >= 10) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0)
  }
  return sum
}

// ✅ Parse HTML ดึงข้อมูล
function parseHTML(html: string) {
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.replace(/<.*?>/g, '').trim() || ''
  const num = parseInt(title.match(/เลขศาสตร์ (\d+)/)?.[1] || '0')
  const p = html.match(/<p>([\u0E00-\u0E7F][^<]{50,}?)<\/p>/)?.[1]?.replace(/<.*?>/g, '').trim() || ''
  return { title, root_number: num, summary: p.substring(0, 500) }
}

// ✅ สร้าง html_path มาตรฐาน
function generateStandardPath(fileUrl: string): string {
  try {
    const url = new URL(fileUrl)
    const paths = url.pathname.split('/')
    const psychomatrixIndex = paths.findIndex(p => p === 'PsychomatrixContents')
    if (psychomatrixIndex === -1) throw new Error('Path not contain PsychomatrixContents')
    const filename = paths.slice(psychomatrixIndex).join('/')
    return `/rainboworcakids/${filename}`
  } catch (e) {
    return fileUrl.replace('https://raw.githubusercontent.com', '').replace('/main', '')
  }
}
