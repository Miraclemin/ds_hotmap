import { NextResponse } from 'next/server';
import { NewsItem } from '@/types';
import db from '@/lib/db';

// 从数据库获取最新新闻（修复版）
async function getNewsFromDB(limit: number = 10): Promise<NewsItem[]> {
  try {
    // 查询最新的新闻，直接使用JOIN获取关联数据
    const result = await db.query(`
      SELECT 
        n.id, n.title, n.content, n.url, 
        n.publish_date, n.relevance, n.deployment_info,
        p.name as province_name,
        c.name as city_name,
        n.district
      FROM news n
      JOIN provinces p ON n.province_id = p.id
      LEFT JOIN cities c ON n.city_id = c.id
      ORDER BY n.publish_date DESC
      LIMIT $1
    `, [limit]);
    
    console.log(`成功获取 ${result.rows.length} 条最新新闻`);
    
    // 将数据库结果格式化为前端需要的格式
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      url: row.url,
      publishDate: row.publish_date instanceof Date 
        ? row.publish_date.toISOString() 
        : row.publish_date,
      location: {
        province: row.province_name,
        city: row.city_name,
        district: row.district
      },
      relevance: row.relevance,
      deploymentInfo: row.deployment_info
    }));
  } catch (error) {
    console.error('从数据库获取新闻失败:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || 10);
    
    // 从数据库获取最新新闻
    const newsData = await getNewsFromDB(limit);
    
    return NextResponse.json({
      success: true,
      data: newsData
    });
  } catch (error) {
    console.error('获取新闻数据失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '获取新闻数据失败',
        data: [] 
      },
      { status: 500 }
    );
  }
} 