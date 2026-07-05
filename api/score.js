const { createClient } = require('@supabase/supabase-js')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, msg: '方法不允许' })
  }

  const { name, score } = req.body
  if (!name || score == null) {
    return res.json({ success: false, msg: '参数错误' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  try {
    const { data: player, error: queryError } = await supabase
      .from('players')
      .select('high_score')
      .eq('name', name)
      .single()

    if (queryError) throw queryError

    if (score > player.high_score) {
      const { error: updateError } = await supabase
        .from('players')
        .update({ high_score: score })
        .eq('name', name)
      
      if (updateError) throw updateError
      res.json({ success: true, newRecord: true, highScore: score })
    } else {
      res.json({ success: true, newRecord: false, highScore: player.high_score })
    }
  } catch (e) {
    res.json({ success: false, msg: '操作失败' })
  }
}