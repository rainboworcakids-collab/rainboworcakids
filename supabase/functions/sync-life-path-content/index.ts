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

    // Fetch HTML (handle 404 gracefully)
    const res = await fetch(file_url)
    if (!res.ok) {
      if (res.status === 404) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'File not found (404)',
          metadata: { file_url }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      }
      throw new Error(`❌ HTTP ${res.status}`)
    }
    const html = await res.text()

    // Parse content
    const parsed = parseHTML(html)
    const lifePathNumber = extractLifePathNumber(file_url)
    const htmlPath = generateStandardPath(file_url)

    // Update DB
    const supabase = createClient(
      Deno.env.get('RAINBOW_URL')!,
      Deno.env.get('RAINBOW_ANON_KEY')!
    )

    const { data, error } = await supabase
      .from('numerology_search_index')
      .upsert({
        id: lifePathNumber + 100, // Reserve ID 101-109 for Life Path (avoid conflict with Destiny 1-99)
        element_type: 'LifePath',
        root_number: lifePathNumber,
        title: parsed.title,
        summary: parsed.summary,
        html_path: htmlPath
      }, { onConflict: 'id' })
      .select('id,title,summary')
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ 
      success: true, 
      data,
      metadata: {
        life_path_number: lifePathNumber,
        html_path: htmlPath
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (err) {
    console.error('💥 Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

// Parse HTML ดึงข้อมูล
function parseHTML(html: string) {
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.replace(/<.*?>/g, '').trim() || ''
  const p = html.match(/<p>([\u0E00-\u0E7F][^<]{50,}?)<\/p>/)?.[1]?.replace(/<.*?>/g, '').trim() || ''
  return { title, summary: p.substring(0, 500) }
}

// ดึง Life Path Number จาก URL
function extractLifePathNumber(fileUrl: string): number {
  try {
    const filename = fileUrl.split('/').pop() || '' // LifePathNumber1.html
    const match = filename.match(/LifePathNumber(\d+)/i)
    return match ? parseInt(match[1]) : 0
  } catch (e) {
    return 0
  }
}

// สร้าง html_path มาตรฐาน
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
