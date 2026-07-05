import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, msg: '方法不允许' })
  }

  const { name, color } = req.body
  if (!name || name.trim().length === 0) {
    return res.json({ success: false, msg: '昵称不能为空' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  const playerName = name.trim()
  const playerColor = color || '#4caf50'

  // 有则更新颜色，无则插入新玩家
  const { data, error } = await supabase
    .from('players')
    .upsert(
      { name: playerName, color: playerColor },
      { onConflict: 'name' }
    )
    .select()
    .single()

  if (error) {
    return res.json({ success: false, msg: '数据库错误' })
  }

  res.json({ success: true, player: data })
}