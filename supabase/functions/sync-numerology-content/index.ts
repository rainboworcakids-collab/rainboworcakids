import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const THAI_STOP_WORDS = ['และ', 'ของ', 'ที่', 'ใน', 'เป็น', 'ได้', 'มี', 'การ', 'กับ', 'แต่', 'ซึ่ง', 'จะ', 'ให้', 'จาก', 'โดย', 'ทั้ง', 'นี้', 'ก่อน', 'หรือ']

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
    const searchVector = generateTSVector(html, parsed, lifePath)
    
    // ✅ สร้าง html_path แบบมาตรฐาน
    const htmlPath = generateStandardPath(file_url)

    // Update DB
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
        search_vector: searchVector,
        html_path: htmlPath  // ✅ ใช้ path มาตรฐาน
      }, { onConflict: 'id' })
      .select('id,title,summary,html_path')
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ 
      success: true, 
      data,
      metadata: {
        root_number: parsed.root_number,
        life_path: lifePath,
        search_terms: searchVector.split(' ').length,
        html_path: htmlPath
      }
    }), {
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

// ✅ สร้าง path มาตรฐาน
function generateStandardPath(fileUrl: string): string {
  // ตัวอย่าง input: https://raw.githubusercontent.com/.../main/PsychomatrixContents/Destiny10.html
  // ต้องการ output: /rainboworcakids/PsychomatrixContents/Destiny10.html
  
  try {
    const url = new URL(fileUrl)
    const paths = url.pathname.split('/')
    
    // หาโฟลเดอร์ PsychomatrixContents และชื่อไฟล์
    const psychomatrixIndex = paths.findIndex(p => p === 'PsychomatrixContents')
    if (psychomatrixIndex === -1) throw new Error('Path not contain PsychomatrixContents')
    
    const filename = paths.slice(psychomatrixIndex).join('/')
    return `/rainboworcakids/${filename}`
  } catch (e) {
    // Fallback ถ้าเกิด error
    return fileUrl.replace('https://raw.githubusercontent.com', '').replace('/main', '')
  }
}

function calculateLifePath(num: number): number {
  let sum = num
  while (sum >= 10) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0)
  }
  return sum
}

function parseHTML(html: string) {
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.replace(/<.*?>/g, '').trim() || ''
  const num = parseInt(title.match(/เลขศาสตร์ (\d+)/)?.[1] || '0')
  const p = html.match(/<p>([\u0E00-\u0E7F][^<]{50,}?)<\/p>/)?.[1]?.replace(/<.*?>/g, '').trim() || ''
  return { title, root_number: num, summary: p.substring(0, 500) }
}

function generateTSVector(html: string, parsed: any, lifePath: number): string {
  const titleText = html.match(/<title>(.*?)<\/title>/i)?.[1]?.replace(/<.*?>/g, ' ') || ''
  const h1Text = html.match(/<h1>(.*?)<\/h1>/i)?.[1]?.replace(/<.*?>/g, ' ') || ''
  const bodyText = html.replace(/<.*?>/g, ' ')
  
  const fullText = (titleText + ' ' + h1Text + ' ' + bodyText).trim()
  const tokens = fullText.split(/\s+/).filter(w => 
    w.length > 1 && /[\u0E00-\u0E7F]/.test(w) && !THAI_STOP_WORDS.includes(w)
  )
  
  const wordPositions = {}
  tokens.forEach((token, index) => {
    if (!wordPositions[token]) wordPositions[token] = []
    wordPositions[token].push(index + 1)
  })
  
  let tsvector = `'${parsed.root_number}':${lifePath}`
  
  for (const [word, positions] of Object.entries(wordPositions)) {
    const limitedPositions = positions.slice(0, 5)
    tsvector += ` '${word}':${limitedPositions.join(',')}`
  }
  
  return tsvector.substring(0, 10000)
}
