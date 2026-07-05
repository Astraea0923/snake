const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// 初始化数据库
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ players: [] }));
}

app.use(express.json());
app.use(express.static(__dirname));

// 读取数据库
function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

// 写入数据库
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// 登录/注册玩家
app.post('/api/player', (req, res) => {
    const { name, color } = req.body;
    if (!name || name.trim().length === 0) {
        return res.json({ success: false, msg: '昵称不能为空' });
    }

    const db = readDB();
    let player = db.players.find(p => p.name === name.trim());

    if (player) {
        // 已存在则更新颜色
        if (color) player.color = color;
    } else {
        // 新玩家
        player = {
            name: name.trim(),
            color: color || '#4caf50',
            highScore: 0,
            createTime: Date.now()
        };
        db.players.push(player);
    }

    writeDB(db);
    res.json({ success: true, player });
});

// 提交分数
app.post('/api/score', (req, res) => {
    const { name, score } = req.body;
    if (!name || score == null) {
        return res.json({ success: false, msg: '参数错误' });
    }

    const db = readDB();
    const player = db.players.find(p => p.name === name);

    if (!player) {
        return res.json({ success: false, msg: '玩家不存在' });
    }

    if (score > player.highScore) {
        player.highScore = score;
        writeDB(db);
        res.json({ success: true, newRecord: true, highScore: score });
    } else {
        res.json({ success: true, newRecord: false, highScore: player.highScore });
    }
});

// 获取排行榜
app.get('/api/rank', (req, res) => {
    const db = readDB();
    const rank = db.players
        .sort((a, b) => b.highScore - a.highScore)
        .slice(0, 10)
        .map((p, i) => ({
            rank: i + 1,
            name: p.name,
            color: p.color,
            score: p.highScore
        }));
    res.json({ success: true, list: rank });
});

app.listen(PORT, () => {
    console.log(`服务已启动: http://localhost:${PORT}`);
});