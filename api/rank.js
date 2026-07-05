import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, msg: '方法不允许' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  const { data, error } = await supabase
    .from('players')
    .select('name, color, high_score')
    .order('high_score', { ascending: false })
    .limit(10)

  if (error) {
    return res.json({ success: false, list: [] })
  }

  const rank = data.map((item, i) => ({
    rank: i + 1,
    name: item.name,
    color: item.color,
    score: item.high_score
  }))

  res.json({ success: true, list: rank })
}