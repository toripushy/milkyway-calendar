const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'records.db');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 支持大图片

let db;

// 初始化数据库
async function initDatabase() {
  // 确保 data 目录存在
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  // 如果数据库文件存在，加载它；否则创建新的
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('已加载现有数据库');
  } else {
    db = new SQL.Database();
    console.log('创建新数据库');
  }

  // 创建表（如果不存在）
  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      name TEXT NOT NULL,
      imageBase64 TEXT,
      price TEXT,
      sugarIce TEXT,
      rating INTEGER,
      shop TEXT,
      moodNote TEXT,
      iconId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      brand TEXT,
      ingredients TEXT,
      calories INTEGER
    )
  `);

  // 创建索引
  db.run('CREATE INDEX IF NOT EXISTS idx_date ON records(date)');

  // 保存数据库
  saveDatabase();
  console.log('数据库初始化完成');
}

// 保存数据库到文件
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// ============ API 端点 ============

// GET /api/records - 获取所有记录
app.get('/api/records', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM records ORDER BY createdAt DESC');
    const records = result.length > 0 ? rowsToObjects(result[0]) : [];
    res.json(records);
  } catch (error) {
    console.error('获取记录失败:', error);
    res.status(500).json({ error: '获取记录失败' });
  }
});

// GET /api/records/month/:year/:month - 按月获取记录
app.get('/api/records/month/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const monthStr = String(month).padStart(2, '0');
    const prefix = `${year}-${monthStr}-%`;
    
    const stmt = db.prepare('SELECT * FROM records WHERE date LIKE ? ORDER BY createdAt ASC');
    stmt.bind([prefix]);
    
    const byDate = {};
    while (stmt.step()) {
      const row = stmt.getAsObject();
      if (!byDate[row.date]) {
        byDate[row.date] = [];
      }
      byDate[row.date].push(row);
    }
    stmt.free();
    
    res.json(byDate);
  } catch (error) {
    console.error('按月获取记录失败:', error);
    res.status(500).json({ error: '按月获取记录失败' });
  }
});

// POST /api/records - 新增记录
app.post('/api/records', (req, res) => {
  try {
    const record = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO records (id, date, name, imageBase64, price, sugarIce, rating, shop, moodNote, iconId, createdAt, brand, ingredients, calories)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      record.id,
      record.date,
      record.name,
      record.imageBase64 || null,
      record.price || null,
      record.sugarIce || null,
      record.rating || null,
      record.shop || null,
      record.moodNote || null,
      record.iconId,
      record.createdAt,
      record.brand || null,
      record.ingredients || null,
      record.calories || null
    ]);
    stmt.free();
    
    saveDatabase();
    res.status(201).json({ success: true, id: record.id });
  } catch (error) {
    console.error('新增记录失败:', error);
    res.status(500).json({ error: '新增记录失败' });
  }
});

// PUT /api/records/:id - 更新记录
app.put('/api/records/:id', (req, res) => {
  try {
    const { id } = req.params;
    const patch = req.body;
    
    // 先获取现有记录
    const result = db.exec(`SELECT * FROM records WHERE id = '${id}'`);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: '记录不存在' });
    }
    
    const existing = rowsToObjects(result[0])[0];
    const updated = { ...existing, ...patch };
    
    const stmt = db.prepare(`
      UPDATE records SET
        date = ?, name = ?, imageBase64 = ?, price = ?, sugarIce = ?,
        rating = ?, shop = ?, moodNote = ?, iconId = ?, createdAt = ?,
        brand = ?, ingredients = ?, calories = ?
      WHERE id = ?
    `);
    
    stmt.run([
      updated.date,
      updated.name,
      updated.imageBase64 || null,
      updated.price || null,
      updated.sugarIce || null,
      updated.rating || null,
      updated.shop || null,
      updated.moodNote || null,
      updated.iconId,
      updated.createdAt,
      updated.brand || null,
      updated.ingredients || null,
      updated.calories || null,
      id
    ]);
    stmt.free();
    
    saveDatabase();
    res.json({ success: true });
  } catch (error) {
    console.error('更新记录失败:', error);
    res.status(500).json({ error: '更新记录失败' });
  }
});

// DELETE /api/records/:id - 删除记录
app.delete('/api/records/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.run(`DELETE FROM records WHERE id = '${id}'`);
    saveDatabase();
    res.json({ success: true });
  } catch (error) {
    console.error('删除记录失败:', error);
    res.status(500).json({ error: '删除记录失败' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 辅助函数：将 sql.js 结果转换为对象数组
function rowsToObjects(result) {
  const { columns, values } = result;
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

// 启动服务器
initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MilkyWay API 服务器运行在 http://0.0.0.0:${PORT}`);
  });
}).catch(error => {
  console.error('启动失败:', error);
  process.exit(1);
});
