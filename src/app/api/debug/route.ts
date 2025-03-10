import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // 测试数据库连接
    const connectionTest = await db.query('SELECT NOW() as time');
    
    // 检查表结构
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    // 统计各表的数据量
    const countResults = await Promise.all([
      db.query('SELECT COUNT(*) as province_count FROM provinces'),
      db.query('SELECT COUNT(*) as city_count FROM cities'),
      db.query('SELECT COUNT(*) as news_count FROM news')
    ]);
    
    // 查看provinces表的前5条记录
    const provincesResult = await db.query(`
      SELECT * FROM provinces LIMIT 5
    `);
    
    return NextResponse.json({
      success: true,
      connectionTime: connectionTest.rows[0].time,
      tables: tablesResult.rows.map(row => row.table_name),
      counts: {
        provinces: countResults[0].rows[0].province_count,
        cities: countResults[1].rows[0].city_count,
        news: countResults[2].rows[0].news_count,
      },
      provinceSamples: provincesResult.rows
    });
  } catch (error) {
    console.error('数据库调试失败:', error);
    return NextResponse.json(
      { 
        success: false,
        message: '数据库调试失败',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 