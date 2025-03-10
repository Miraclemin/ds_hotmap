import { Pool } from 'pg';

// 数据库连接配置
const connectionString = process.env.DATABASE_URL;

// 验证数据库URL是否存在
if (!connectionString) {
  console.error('错误: 未设置数据库URL环境变量 (DATABASE_URL)');
  // 开发环境下继续执行，生产环境直接退出
  if (process.env.NODE_ENV === 'production') {
    throw new Error('生产环境中必须设置DATABASE_URL环境变量');
  }
}

// 创建连接池
const pool = new Pool({
  connectionString,
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 连接最大空闲时间
  connectionTimeoutMillis: 2000, // 连接超时
  ssl: process.env.NODE_ENV === 'production' // 生产环境使用SSL
});

// 监听连接错误
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// 检查数据库连接（在应用启动时调用）
async function checkConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    client.release();
    console.log('数据库连接成功，时间:', result.rows[0].time);
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
}

// 执行SQL查询
async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('执行查询', { 
      text: text.split('\n')[0] + '...', // 只记录查询的第一行
      duration, 
      rows: res.rowCount 
    });
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('查询失败:', error, { text, duration });
    throw error;
  }
}

// 关闭数据库连接
function closePool() {
  return pool.end();
}

// 启动时检查连接
checkConnection();

export default {
  query,
  closePool,
  checkConnection
}; 